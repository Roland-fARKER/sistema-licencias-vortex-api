import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { License } from '../licenses/entities/license.entity';

@Module({
    imports: [TypeOrmModule.forFeature([License])],
    providers: [TasksService],
})
export class TasksModule { }
