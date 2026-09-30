import { IDashboardRepository } from './contract';
import { MockDashboardRepository } from './mock';
import { RemoteDashboardRepository } from './remote';

const useMock =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' ||
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  !process.env.NEXT_PUBLIC_DATA_SOURCE;

export const dashboardRepository: IDashboardRepository = useMock
  ? new MockDashboardRepository()
  : new RemoteDashboardRepository();

export * from './contract';
export { MockDashboardRepository } from './mock';
export { RemoteDashboardRepository } from './remote';
