import { IExecutionRepository } from './contract';
import { MockExecutionRepository } from './mock';
import { RemoteExecutionRepository } from './remote';

const useMock =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'mock' ||
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  !process.env.NEXT_PUBLIC_DATA_SOURCE;

export const executionRepository: IExecutionRepository = useMock
  ? new MockExecutionRepository()
  : new RemoteExecutionRepository();

export * from './contract';
export { MockExecutionRepository } from './mock';
export { RemoteExecutionRepository } from './remote';
