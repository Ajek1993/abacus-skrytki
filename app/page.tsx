'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee, SkrytkaKod, HistoriaKod } from '@/lib/types';

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skrytki, setSkrytki] = useState<SkrytkaKod[]>([]);
  const [historia, setHistoria] = useState<HistoriaKod[]>([]);
  const [filterSkrytka, setFilterSkrytka] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stan dla każdej skrytki
  const [formData, setFormData] = useState<{
    [key: number]: {
      employeeId: string;
      newKod: string;
    };
  }>({
    1: { employeeId: '', newKod: '' },
    2: { employeeId: '', newKod: '' },
    3: { employeeId: '', newKod: '' },
    4: { employeeId: '', newKod: '' },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz pracowników
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('nazwisko', { ascending: true });

      if (employeesError) throw employeesError;

      // Pobierz dane skrytek
      const { data: skrytkiData, error: skrytkiError } = await supabase
        .from('skrytki_kody')
        .select('*')
        .order('skrytka_numer', { ascending: true });

      if (skrytkiError) throw skrytkiError;

      // Pobierz historię (ostatnie 50 zmian)
      const { data: historiaData, error: historiaError } = await supabase
        .from('historia_kodow')
        .select('*')
        .order('data_zmiany', { ascending: false })
        .limit(50);

      if (historiaError) throw historiaError;

      setEmployees(employeesData || []);
      setSkrytki(skrytkiData || []);
      setHistoria(historiaData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania danych');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (skrytkaNumer: number, field: 'employeeId' | 'newKod', value: string) => {
    setFormData(prev => ({
      ...prev,
      [skrytkaNumer]: {
        ...prev[skrytkaNumer],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (skrytkaNumer: number) => {
    const { employeeId, newKod } = formData[skrytkaNumer];

    if (!employeeId || !newKod.trim()) {
      setError('Wybierz pracownika i wprowadź nowy kod');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const skrytka = skrytki.find(s => s.skrytka_numer === skrytkaNumer);
      if (!skrytka) return;

      const { error: updateError } = await supabase
        .from('skrytki_kody')
        .update({
          kod_poprzedni: skrytka.kod_aktualny,
          kod_aktualny: newKod.trim(),
          zmienil_employee_id: employeeId,
          data_zmiany: new Date().toISOString(),
        })
        .eq('skrytka_numer', skrytkaNumer);

      if (updateError) throw updateError;

      // Wyczyść formularz dla tej skrytki
      setFormData(prev => ({
        ...prev,
        [skrytkaNumer]: { employeeId: '', newKod: '' },
      }));

      setSuccessMessage(`Kod skrytki ${skrytkaNumer} został zaktualizowany`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Odśwież dane
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Nieznany';
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.imie} ${employee.nazwisko}` : 'Nieznany';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistoria = filterSkrytka === 'all'
    ? historia
    : historia.filter(h => h.skrytka_numer === filterSkrytka);

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Zarządzanie Skrytkami</h1>
        <p>System zarządzania kodami dostępu</p>
      </div>

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success">{successMessage}</div>}

      <div className="skrytki-grid">
        {skrytki.map(skrytka => (
          <div key={skrytka.id} className="skrytka-card">
            <div className="skrytka-header">Skrytka {skrytka.skrytka_numer}</div>

            <div className="kod-display">
              <div className="kod-label">Aktualny kod:</div>
              <div className="kod-value">{skrytka.kod_aktualny}</div>
            </div>

            {skrytka.kod_poprzedni && (
              <div className="kod-display">
                <div className="kod-label">Poprzedni kod:</div>
                <div className="kod-value">{skrytka.kod_poprzedni}</div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor={`employee-${skrytka.skrytka_numer}`}>Wybierz pracownika:</label>
              <select
                id={`employee-${skrytka.skrytka_numer}`}
                value={formData[skrytka.skrytka_numer].employeeId}
                onChange={(e) => handleInputChange(skrytka.skrytka_numer, 'employeeId', e.target.value)}
              >
                <option value="">-- Wybierz --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.imie} {emp.nazwisko}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={`kod-${skrytka.skrytka_numer}`}>Nowy kod:</label>
              <input
                type="text"
                id={`kod-${skrytka.skrytka_numer}`}
                value={formData[skrytka.skrytka_numer].newKod}
                onChange={(e) => handleInputChange(skrytka.skrytka_numer, 'newKod', e.target.value)}
                placeholder="Wprowadź nowy kod"
              />
            </div>

            <button
              className="button"
              onClick={() => handleSubmit(skrytka.skrytka_numer)}
            >
              Zapisz zmianę
            </button>

            <div className="meta-info">
              <div>Ostatnia zmiana: {formatDate(skrytka.data_zmiany)}</div>
              <div>Zmienił: {getEmployeeName(skrytka.zmienil_employee_id)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="historia-section">
        <div className="historia-header-container">
          <h2 className="historia-header">Historia zmian</h2>
          <div className="filter-group">
            <label htmlFor="filter-skrytka">Filtruj po skrytce:</label>
            <select
              id="filter-skrytka"
              value={filterSkrytka}
              onChange={(e) => setFilterSkrytka(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="filter-select"
            >
              <option value="all">Wszystkie</option>
              <option value="1">Skrytka 1</option>
              <option value="2">Skrytka 2</option>
              <option value="3">Skrytka 3</option>
              <option value="4">Skrytka 4</option>
            </select>
          </div>
        </div>
        <div className="historia-table-container">
          <table className="historia-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Skrytka</th>
                <th>Poprzedni kod</th>
                <th>Nowy kod</th>
                <th>Zmienił</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistoria.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">Brak historii zmian</td>
                </tr>
              ) : (
                filteredHistoria.map(entry => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.data_zmiany)}</td>
                    <td className="skrytka-number">Skrytka {entry.skrytka_numer}</td>
                    <td className="kod-cell">{entry.kod_poprzedni || '-'}</td>
                    <td className="kod-cell">{entry.kod}</td>
                    <td>{getEmployeeName(entry.zmienil_employee_id)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
