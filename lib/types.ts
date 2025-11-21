export interface Employee {
  id: string;
  imie: string;
  nazwisko: string;
  created_at?: string;
}

export interface SkrytkaKod {
  id: string;
  skrytka_numer: number;
  kod_aktualny: string;
  kod_poprzedni: string | null;
  zmienil_employee_id: string | null;
  data_zmiany: string;
}

export interface HistoriaKod {
  id: string;
  skrytka_numer: number;
  kod: string;
  kod_poprzedni?: string | null;
  zmienil_employee_id: string | null;
  data_zmiany: string;
}
