import { Author } from './author.interface';
import { Observation } from './observation.interface';

export interface Report {
  id: number;
  author: Author;
  observations: Observation[];
  description: string;
}
