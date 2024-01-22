export class Report {
  author: Author;
  observations: Observation[];
  description: string;
}

export class ReportWithId extends Report {
  id: number;
}

export class Author {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  sex: 'Male' | 'Female' | 'Non-binary';
}

export class Observation {
  id: number;
  name: string;
}

export class CreateReport {
  author: Author;
  observations: number[];
  description: string;
}
