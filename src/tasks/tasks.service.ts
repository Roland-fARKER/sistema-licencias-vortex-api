import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { License } from '../licenses/entities/license.entity';
import { LicenseStatus } from '../common/enums/license-status.enum';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        @InjectRepository(License)
        private licensesRepository: Repository<License>,
        private mailerService: MailerService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleLicenseExpirations() {
        this.logger.log('Checking for expiring licenses...');

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // 1. Find licenses expiring in 7 days
        const expiringSoon = await this.licensesRepository.find({
            where: {
                endDate: LessThan(nextWeek),
                status: LicenseStatus.ACTIVE,
            },
            relations: ['customer', 'product'],
        });

        for (const license of expiringSoon) {
            if (license.endDate < today) {
                // Already expired
                license.status = LicenseStatus.EXPIRED;
                await this.licensesRepository.save(license);

                await this.sendEmail(license, 'Your license has expired', 'expired');
            } else {
                // Expiring soon
                await this.sendEmail(license, 'Your license is about to expire', 'expiring-soon');
            }
        }
    }

    private async sendEmail(license: License, subject: string, template: string) {
        try {
            await this.mailerService.sendMail({
                to: license.customer.email,
                subject: subject,
                template: template,
                context: {
                    customerName: license.customer.name,
                    productName: license.product.name,
                    expiryDate: license.endDate.toLocaleDateString(),
                },
            });
            this.logger.log(`Email sent to ${license.customer.email} for product ${license.product.name}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${license.customer.email}: ${error.message}`);
        }
    }
}
