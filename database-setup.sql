-- Tabela pracowników
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    imie VARCHAR(100) NOT NULL,
    nazwisko VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela aktualnych kodów skrytek
CREATE TABLE skrytki_kody (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skrytka_numer INTEGER NOT NULL CHECK (skrytka_numer BETWEEN 1 AND 4),
    kod_aktualny VARCHAR(50) NOT NULL,
    kod_poprzedni VARCHAR(50),
    zmienil_employee_id UUID REFERENCES employees(id),
    data_zmiany TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(skrytka_numer)
);

-- Tabela historii zmian kodów
CREATE TABLE historia_kodow (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skrytka_numer INTEGER NOT NULL CHECK (skrytka_numer BETWEEN 1 AND 4),
    kod VARCHAR(50) NOT NULL,
    kod_poprzedni VARCHAR(50),
    zmienil_employee_id UUID REFERENCES employees(id),
    data_zmiany TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wstaw początkowe rekordy dla 4 skrytek (z przykładowymi kodami)
INSERT INTO skrytki_kody (skrytka_numer, kod_aktualny, kod_poprzedni) VALUES
    (1, '0000', NULL),
    (2, '0000', NULL),
    (3, '0000', NULL),
    (4, '0000', NULL);

-- Przykładowi pracownicy (możesz dodać swoich)
INSERT INTO employees (imie, nazwisko) VALUES
    ('Jan', 'Kowalski'),
    ('Anna', 'Nowak'),
    ('Piotr', 'Wiśniewski');

-- Funkcja do automatycznego zapisywania historii przy zmianie kodu
CREATE OR REPLACE FUNCTION log_kod_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.kod_aktualny <> OLD.kod_aktualny THEN
        INSERT INTO historia_kodow (skrytka_numer, kod, kod_poprzedni, zmienil_employee_id, data_zmiany)
        VALUES (NEW.skrytka_numer, NEW.kod_aktualny, OLD.kod_aktualny, NEW.zmienil_employee_id, NEW.data_zmiany);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego logowania zmian
CREATE TRIGGER trigger_log_kod_change
AFTER UPDATE ON skrytki_kody
FOR EACH ROW
EXECUTE FUNCTION log_kod_change();
