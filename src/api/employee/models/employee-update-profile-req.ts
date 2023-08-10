import type { ProfileFullDetails } from './profile-full-details';

export interface EmployeeUpdateProfileReq
  extends Omit<
    Partial<ProfileFullDetails>,
    '_id' | 'verified' | 'email' | 'createdAt' | 'updatedAt' | 'rate' | 'reviews' | 'skills' | 'specialization'
  > {
  skills: Array<string>;
  specialization: Array<string>;
}
