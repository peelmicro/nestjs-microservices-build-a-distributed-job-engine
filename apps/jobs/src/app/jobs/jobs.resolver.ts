import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from './models/job.model';
import { ExecuteJobInput } from './dto/execute-job.input';
import { GqlAuthGuard } from '@jobber/nestjs';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job], { name: 'jobsMetadata' })
  @UseGuards(GqlAuthGuard)
  async getJobsMetadata() {
    return this.jobsService.getJobsMetadata();
  }

  @Mutation(() => Job)
  @UseGuards(GqlAuthGuard)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
    return this.jobsService.executeJob(executeJobInput.name);
  }
}
