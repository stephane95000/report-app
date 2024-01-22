import { Gender } from './gender.enum';

export interface Author {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: Date;
  sex: Gender;
}
