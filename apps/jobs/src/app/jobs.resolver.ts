import { Mutation, Args, Query, Resolver } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { ExecuteJobInput } from './dto/execute-job.input';
import { GqlAuthGuard } from '@jobber/graphql';
import { UseGuards } from '@nestjs/common';
import { Job } from './models/job.model';
import { JobMetadata } from './models/job-metadata.model';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [JobMetadata], { name: 'jobsMetadata' })
  @UseGuards(GqlAuthGuard)
  async getJobsMetadata() {
    return this.jobsService.getJobsMetadata();
  }

  @Mutation(() => Job)
  @UseGuards(GqlAuthGuard)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
    await this.jobsService.executeJob(
      executeJobInput.name,
      executeJobInput?.data,
    );

    // Return a Job object to satisfy the GraphQL schema
    const job = this.jobsService.getJobByName(executeJobInput.name);
    return job;
  }

  @Query(() => [Job], { name: 'jobs' })
  @UseGuards(GqlAuthGuard)
  async getJobs() {
    return this.jobsService.getJobs();
  }

  @Query(() => Job, { name: 'job' })
  @UseGuards(GqlAuthGuard)
  async getJob(@Args('id') id: number) {
    return this.jobsService.getJob(id);
  }

  @Query(() => Job, { name: 'jobByName' })
  @UseGuards(GqlAuthGuard)
  async getJobByName(@Args('name') name: string) {
    return this.jobsService.getJobByName(name);
  }
}
