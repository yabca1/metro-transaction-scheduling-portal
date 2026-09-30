import { IScheduleRepository } from './contract';
import { MockScheduleRepository } from './mock';
import { RemoteScheduleRepository } from './remote';

const useMock =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' ||
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  !process.env.NEXT_PUBLIC_DATA_SOURCE;

export const scheduleRepository: IScheduleRepository = useMock
  ? new MockScheduleRepository()
  : new RemoteScheduleRepository();

export * from './contract';
export { MockScheduleRepository } from './mock';
export { RemoteScheduleRepository } from './remote';
