import { utils, writeFile } from 'xlsx';
import dayjs from 'dayjs';
import { Flight } from '../types/flight';
import { LinkedRow } from './linkFromDaily';
import { AutoLinkedRow } from './autoLinkFromDaily';
import { LoadRow } from './buildLoadRows';

/**
 * Export daily flights to Excel (long format)
 */
export function exportDailyFlights(flights: Flight[], filename?: string): void {
  if (flights.length === 0) {
    throw new Error('No flights to export');
  }

  // Prepare data for Excel - Daily format (long)
  const exportData = flights.map(f => ({
    'Airline': f.Airline,
    'Operator Flight Number': f['Operator Flight Number'],
    'Flight Suffix': f['Flight Suffix'] || 'O',
    'Station': f.Station,
    'STAD': f.STAD, // DD/MM/YYYY HH:mm:ss format
    'Flight Service Type': f['Flight Service Type'],
  }));

  const ws = utils.json_to_sheet(exportData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Daily Flights');

  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const outputFilename = filename || `daily_flights_${timestamp}_${flights.length}.xlsx`;
  
  writeFile(wb, outputFilename);
}

/**
 * Export linked flights to Excel (wide format)
 */
export function exportLinkedFlights(linkedRows: LinkedRow[], filename?: string): void {
  if (linkedRows.length === 0) {
    throw new Error('No linked flights to export');
  }

  // Ensure column order is exactly as specified
  const exportData = linkedRows.map(row => ({
    'ARR_FLC': row.ARR_FLC,
    'ARR_FLN': row.ARR_FLN,
    'ARR_FLX': row.ARR_FLX,
    'ARR_SDT': row.ARR_SDT,
    'ARR_STA': row.ARR_STA,
    'REG': row.REG,
    'DEP_FLC': row.DEP_FLC,
    'DEP_FLN': row.DEP_FLN,
    'DEP_FLX': row.DEP_FLX,
    'DEP_SDT': row.DEP_SDT,
    'DEP_STD': row.DEP_STD,
  }));

  const ws = utils.json_to_sheet(exportData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Linked Flights');

  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const outputFilename = filename || `linked_flights_${timestamp}_${linkedRows.length}.xlsx`;
  
  writeFile(wb, outputFilename);
}

/**
 * Export auto-linked flights to Excel (wide format, no matching)
 */
export function exportAutoLinkedFlights(autoLinkedRows: AutoLinkedRow[], filename?: string): void {
  if (autoLinkedRows.length === 0) {
    throw new Error('No auto-linked flights to export');
  }

  // Ensure column order is exactly as specified
  const header = [
    'ARR_FLC', 'ARR_FLN', 'ARR_FLX', 'ARR_SDT', 'ARR_STA', 'REG',
    'DEP_FLC', 'DEP_FLN', 'DEP_FLX', 'DEP_SDT', 'DEP_STD'
  ];

  const exportData = autoLinkedRows.map(row => ({
    'ARR_FLC': row.ARR_FLC,
    'ARR_FLN': row.ARR_FLN,
    'ARR_FLX': row.ARR_FLX,
    'ARR_SDT': row.ARR_SDT,
    'ARR_STA': row.ARR_STA,
    'REG': row.REG,
    'DEP_FLC': row.DEP_FLC,
    'DEP_FLN': row.DEP_FLN,
    'DEP_FLX': row.DEP_FLX,
    'DEP_SDT': row.DEP_SDT,
    'DEP_STD': row.DEP_STD,
  }));

  const ws = utils.json_to_sheet(exportData, { header });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'AutoLinked');

  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const outputFilename = filename || `auto_linked_flights_${timestamp}_${autoLinkedRows.length}.xlsx`;
  
  writeFile(wb, outputFilename);
}

/**
 * Export load data to Excel
 */
export function exportLoadExcel(rows: LoadRow[], filename?: string): void {
  if (rows.length === 0) {
    throw new Error('No load rows to export');
  }

  // Ensure column order is exactly as specified
  const header = [
    'Date', 'Operator Flight Number', 'Origin Station', 'Destination Station',
    'Reg', 'Flight Service Type', 'totalpax', 'child', 'adult'
  ];

  const exportData = rows.map(row => ({
    'Date': row.Date,
    'Operator Flight Number': row['Operator Flight Number'],
    'Origin Station': row['Origin Station'],
    'Destination Station': row['Destination Station'],
    'Reg': row.Reg,
    'Flight Service Type': row['Flight Service Type'],
    'totalpax': row.totalpax,
    'child': row.child,
    'adult': row.adult,
  }));

  const ws = utils.json_to_sheet(exportData, { header });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Load');

  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const outputFilename = filename || `load_${timestamp}_${rows.length}.xlsx`;
  
  writeFile(wb, outputFilename);
}

