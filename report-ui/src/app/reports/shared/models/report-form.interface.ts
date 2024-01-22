import { Author } from './author.interface';

export interface IReportForm {
  author: Author;
  observations: number[];
  description: string;
}
