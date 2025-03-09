import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from './models/job.model';
import { ExecuteJobInput } from './dto/execute-job.input';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job], { name: 'jobsMetadata' })
  async getJobsMetadata() {
    return this.jobsService.getJobsMetadata();
  }

  @Mutation(() => Job)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
    return this.jobsService.executeJob(executeJobInput.name);
  }
}
