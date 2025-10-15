import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Flight, FlightGeneratorConfig, TimezoneMode, DistributionMode } from '../../types/flight';
import { generateFlights, validateConfig } from '../../utils/generateFlights';
import { exportDailyFlights, exportLinkedFlights } from '../../utils/exporters';
import { buildLinkedRowsFromDaily, DailyRow } from '../../utils/linkFromDaily';

const DEFAULT_AIRLINES = ['AJ', 'TK', 'PC', 'LH', 'SU', 'QR', 'FZ', 'W6'];
const DEFAULT_REMOTE_STATIONS = ['BCN', 'IST', 'DOH', 'SAW', 'FRA', 'DXB', 'AMS', 'LHR', 'KWI', 'MUC', 'CDG'];
const DEFAULT_SERVICE_TYPES = ['J', 'D', 'C', 'P'];
const DEFAULT_REGISTRATIONS = [
  'TCOHE', 'TCOHF', 'TCLPT', 'TCTSM', 'TCLMD', 'TCRFU', 'TCMYA', 'TCLHG',
  'TCMYB', 'TCLBC', 'TCMGR', 'TCLBP', 'TCRFT', 'TCOHD', 'TCOHC', 'TCMCU',
  'TCLPS', 'TCOHA', 'TCISL', 'TCOHB', 'TCLBM', 'TCRFR', 'TCRFS', 'TCRFP',
  'TCJMP', 'TCRFO', 'TCMCN', 'TCVEL', 'TCLHF', 'TCULE', 'TCLMC', 'TCCBA',
  'TCLBV', 'TCRFN', 'TCMZS', 'TCMCM', 'TCEGG', 'TCMCO', 'TCLPR', 'TCMCZ',
  'TCMGO', 'TCGRZ', 'TCMGP', 'TCANT', 'TCKMK', 'TCMNZ', 'TCMCP', 'TCLBU',
  'TCLHE', 'TCLHD', 'TCJDR', 'TCMAK', 'TCKRZ', 'TCFYI', 'TCCRC', 'TCRFM',
  'TCKRG', 'TCJOO', 'TCIST', 'TCATA', 'TCMRK', 'TCGPG', 'TCGPF', 'TCNBS',
  'TCLHC', 'TCJTV', 'TCLHB', 'TCRFL', 'TCLPP', 'TCJOV', 'TCLPO', 'TCGRD',
  'TCGRO', 'TCMZK', 'TCFUN', 'TCEIA', 'TCGKL', 'TCIHY', 'TCLON', 'TCRFK',
  'TCLPG', 'TCMGK', 'TCGRC', 'TCJTY', 'TCKZU', 'TCHTN', 'TCERB', 'TCRSI',
  'TCRFF', 'TCRFJ', 'TCMGL', 'TCLPM', 'TCMGN', 'TCGHL', 'TCRFI', 'TCRFE',
  'TCLPL', 'TCMGT', 'TCRFD', 'TCJTT', 'TCLPK', 'TCDBA', 'TCJTS', 'TCSMP',
  'TCGMB', 'TCLPN', 'TCGEH', 'TCJTU', 'TCRFG', 'TCRFH', 'TCLHA', 'TCFAA',
  'TCSML', 'TCLPJ', 'TCLAC', 'TCTUM', 'TCGVN', 'TCEMR', 'TCREG', 'TCRMS',
  'TCHKE', 'TCVLK', 'TCALN', 'TCVRG', 'TCTAR', 'TCBJ', 'TCLPI', 'TCKRF',
  'TCHYH', 'TCLGZ', 'TCSRB', 'TCLGY', 'TCJKC', 'TCJKB', 'TCMGJ', 'TCZSZ',
  'TCTIM', 'TCRFB', 'TCLGU', 'TCLGO', 'TCSTR', 'TCLLV', 'TCLPF', 'TCJFA',
  'TCLPH', 'TCLLY', 'TCLLZ', 'TCSPZ', 'TCLPE', 'TCFHF', 'TCDBF', 'TCHSA',
  'TCLLT', 'TCLGS', 'TCLGT', 'TCLGV', 'TCSMN', 'TCSPV', 'TCLGR', 'TCLGP',
  'TCKRD', 'TCRFA', 'TCHZM', 'TCJKT', 'TCMZE', 'TCHOH', 'TCMAY', 'TCRFC',
  'TCRDZ', 'TCTBR', 'TCHFZ', 'TCMLR', 'TCLKF', 'TCSPY', 'TCRDY', 'TCLOM',
  'TCSRC', 'TCRDV', 'TCMGA', 'TCUNL', 'TCNYB', 'TCIMN', 'TCMER', 'TCJOY',
  'TCLHO', 'TCRDO', 'TCLPD', 'TCHRK', 'TCGRK', 'TCAKD', 'TCHVS', 'TCGRJ',
  'TCERM', 'TCARK', 'TCKYA', 'TCVHZ', 'TCRDM', 'TCRSH', 'TCLMT', 'TCGMA',
  'TCLMB', 'TCCDY', 'TCCKD', 'TCLPC', 'TCGPE', 'TCHKT', 'TCGPD', 'TCGPC',
  'TCGPA', 'TCCBK', 'TCDAP', 'TCRDK', 'TCSMK', 'TCLPB', 'TCRDN', 'TCCEM',
  'TCLJS', 'TCLYL', 'TCCGZ', 'TCLUR', 'TCRDS', 'TCRDL', 'TCJCI', 'TCRDT',
  'TCHDL', 'TCDTR', 'TCRDU', 'TCMGI', 'TCHZH', 'TCNYK', 'TCCMD', 'TCLMA',
  'TCRDR', 'TCGLF', 'TCMYZ', 'TCMGH', 'TCRDP', 'TCLPA', 'TCJEJ', 'TCACA',
  'TCATS', 'TCLTY', 'TCSPS', 'TCMKG'
];

export default function FlightGenerator() {
  // Form state
  const [startDatetime, setStartDatetime] = useState<string>(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [endDatetime, setEndDatetime] = useState<string>(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'));
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('Local');
  const [homeAirport, setHomeAirport] = useState<string>('ADB');
  const [numberOfPairs, setNumberOfPairs] = useState<number>(200);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(DEFAULT_AIRLINES);
  const [customAirlines, setCustomAirlines] = useState<string>('');
  const [flightNumberMin, setFlightNumberMin] = useState<number>(100);
  const [flightNumberMax, setFlightNumberMax] = useState<number>(3999);
  const [useCustomStations, setUseCustomStations] = useState<boolean>(false);
  const [customStations, setCustomStations] = useState<string>('');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(DEFAULT_SERVICE_TYPES);
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(DEFAULT_REGISTRATIONS);
  const [customRegistrations, setCustomRegistrations] = useState<string>('');
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('Uniform');
  const [minGroundTime, setMinGroundTime] = useState<number>(30);
  const [maxGroundTime, setMaxGroundTime] = useState<number>(180);
  const [minGroundTimeForLink, setMinGroundTimeForLink] = useState<number>(30);
  const [seed, setSeed] = useState<string>('');
  const [previewLimit, setPreviewLimit] = useState<number>(1000);

  // API Post state
  const [apiEnabled, setApiEnabled] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [apiBearerToken, setApiBearerToken] = useState<string>('');
  const [apiBatchSize, setApiBatchSize] = useState<number>(500);

  // Data state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postProgress, setPostProgress] = useState<string>('');

  // Table state
  const [sortColumn, setSortColumn] = useState<keyof Flight | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterAirline, setFilterAirline] = useState<string>('');
  const [filterStation, setFilterStation] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

  // Get airlines list (selected + custom)
  const airlinesList = useMemo(() => {
    const custom = customAirlines
      .split(',')
      .map(a => a.trim().toUpperCase())
      .filter(a => a.length > 0);
    return [...new Set([...selectedAirlines, ...custom])];
  }, [selectedAirlines, customAirlines]);

  // Get remote stations list
  const remoteStationsList = useMemo(() => {
    if (useCustomStations) {
      return customStations
        .split('\n')
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length === 3);
    }
    return DEFAULT_REMOTE_STATIONS;
  }, [useCustomStations, customStations]);

  // Get registrations list (selected + custom)
  const registrationsList = useMemo(() => {
    const custom = customRegistrations
      .split('\n')
      .map(r => r.trim().toUpperCase())
      .filter(r => r.length > 0);
    return [...new Set([...selectedRegistrations, ...custom])];
  }, [selectedRegistrations, customRegistrations]);

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let filtered = flights.slice(0, previewLimit);

    if (filterAirline) {
      filtered = filtered.filter(f => f.Airline === filterAirline);
    }

    if (filterStation) {
      filtered = filtered.filter(f => f.Station.includes(filterStation));
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [flights, previewLimit, filterAirline, filterStation, sortColumn, sortDirection]);

  // Pagination
  const paginatedFlights = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredFlights.slice(start, end);
  }, [filteredFlights, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredFlights.length / rowsPerPage);

  // Get unique values for filters
  const uniqueAirlines = useMemo(() => {
    return [...new Set(flights.map(f => f.Airline))].sort();
  }, [flights]);

  const uniqueStations = useMemo(() => {
    return [...new Set(flights.map(f => f.Station))].sort();
  }, [flights]);

  const handleSort = (column: keyof Flight) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setErrors([]);
    
    try {
      const config: FlightGeneratorConfig = {
        startDatetime: new Date(startDatetime),
        endDatetime: new Date(endDatetime),
        timezoneMode,
        homeAirport: homeAirport.trim().toUpperCase(),
        numberOfPairs,
        airlines: airlinesList,
        flightNumberMin,
        flightNumberMax,
        remoteStations: remoteStationsList,
        serviceTypes: selectedServiceTypes,
        registrations: registrationsList,
        distributionMode,
        minGroundTime,
        maxGroundTime,
        seed: seed || undefined,
        previewLimit,
      };

      const validationErrors = validateConfig(config);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsGenerating(false);
        return;
      }

      const generatedFlights = generateFlights(config);
      setFlights(generatedFlights);
      setCurrentPage(1);
      
      // If API posting is enabled, post the data
      if (apiEnabled && apiEndpoint && apiBearerToken) {
        postToAPI(generatedFlights);
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportDaily = () => {
    if (flights.length === 0) {
      alert('No data to export. Please generate flights first.');
      return;
    }

    try {
      exportDailyFlights(flights);
      alert(`Successfully exported ${flights.length} flights!`);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExportLink = () => {
    if (flights.length === 0) {
      alert('No data to export. Please generate flights first.');
      return;
    }

    // Validate home airport
    const home = homeAirport.trim().toUpperCase();
    if (home.length !== 3) {
      alert('Home airport must be exactly 3 letters (IATA code)');
      return;
    }

    try {
      // Convert flights to DailyRow format
      const dailyRows: DailyRow[] = flights.map(f => ({
        Airline: f.Airline,
        'Operator Flight Number': f['Operator Flight Number'],
        'Flight Suffix': f['Flight Suffix'],
        Station: f.Station,
        SDT: f.SDT,
        STA: f.STA,
        STD: f.STD,
        REG: f.REG,
      }));

      // Build linked rows
      const { linked, stats } = buildLinkedRowsFromDaily(
        dailyRows,
        home,
        minGroundTimeForLink
      );

      // Show warnings if any
      if (stats.warnings.length > 0) {
        console.warn('Link generation warnings:', stats.warnings);
      }

      // Show statistics
      const message = [
        `Matched pairs: ${stats.matched}`,
        stats.skippedArr > 0 ? `Unmatched arrivals: ${stats.skippedArr}` : null,
        stats.skippedDep > 0 ? `Unmatched departures: ${stats.skippedDep}` : null,
        stats.warnings.length > 0 ? `Warnings: ${stats.warnings.length} (see console)` : null,
      ].filter(Boolean).join('\n');

      if (linked.length === 0) {
        alert('No linked flights could be generated.\n\n' + message);
        return;
      }

      // Export
      exportLinkedFlights(linked);
      alert(`Successfully exported ${linked.length} linked pairs!\n\n` + message);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const postToAPI = async (flightsToPost: Flight[]) => {
    setIsPosting(true);
    setPostProgress('');

    const batches = [];
    for (let i = 0; i < flightsToPost.length; i += apiBatchSize) {
      batches.push(flightsToPost.slice(i, i + apiBatchSize));
    }

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setPostProgress(`Posting batch ${i + 1} of ${batches.length}...`);

        let attempt = 0;
        const maxRetries = 3;
        let success = false;

        while (attempt < maxRetries && !success) {
          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiBearerToken}`,
              },
              body: JSON.stringify(batch),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            success = true;
          } catch (error) {
            attempt++;
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              setPostProgress(`Batch ${i + 1} failed, retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
      }

      setPostProgress(`✓ Successfully posted ${flightsToPost.length} flights in ${batches.length} batches`);
    } catch (error) {
      setPostProgress(`✗ Error: ${error instanceof Error ? error.message : 'Failed to post'}`);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  const toggleServiceType = (serviceType: string) => {
    setSelectedServiceTypes(prev =>
      prev.includes(serviceType)
        ? prev.filter(st => st !== serviceType)
        : [...prev, serviceType]
    );
  };

  const toggleRegistration = (registration: string) => {
    setSelectedRegistrations(prev =>
      prev.includes(registration)
        ? prev.filter(r => r !== registration)
        : [...prev, registration]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Flight Data Generator
        </h1>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Validation Errors:</h3>
            <ul className="list-disc list-inside text-red-700 dark:text-red-300">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>

          {/* Date Range */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Datetime *
                </label>
                <input
                  type="datetime-local"
                  value={startDatetime}
                  onChange={(e) => setStartDatetime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Datetime *
                </label>
                <input
                  type="datetime-local"
                  value={endDatetime}
                  onChange={(e) => setEndDatetime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="inline-flex items-center mr-6">
                <input
                  type="radio"
                  checked={timezoneMode === 'Local'}
                  onChange={() => setTimezoneMode('Local')}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Local Time</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={timezoneMode === 'UTC'}
                  onChange={() => setTimezoneMode('UTC')}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">UTC</span>
              </label>
            </div>
          </div>

          {/* Home Airport & Pairs */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Home Airport (IATA) *
              </label>
              <input
                type="text"
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="ADB"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                # of Pairs (Turn-around) * <span className="text-xs text-gray-500">(1-10,000)</span>
              </label>
              <input
                type="number"
                value={numberOfPairs}
                onChange={(e) => setNumberOfPairs(parseInt(e.target.value) || 0)}
                min={1}
                max={10000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Total flights: {numberOfPairs * 2}</p>
            </div>
          </div>

          {/* Airlines */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Airlines</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_AIRLINES.map(airline => (
                <button
                  key={airline}
                  onClick={() => toggleAirline(airline)}
                  className={`px-3 py-1 rounded-md font-medium ${
                    selectedAirlines.includes(airline)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {airline}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Airlines (comma-separated)
            </label>
            <input
              type="text"
              value={customAirlines}
              onChange={(e) => setCustomAirlines(e.target.value)}
              placeholder="e.g., EK, BA, AF"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Flight Numbers */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Flight Number Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  value={flightNumberMin}
                  onChange={(e) => setFlightNumberMin(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  value={flightNumberMax}
                  onChange={(e) => setFlightNumberMax(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Remote Stations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Remote Stations</h3>
            <div className="mb-3">
              <label className="inline-flex items-center mr-6">
                <input
                  type="radio"
                  checked={!useCustomStations}
                  onChange={() => setUseCustomStations(false)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Use Default List</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={useCustomStations}
                  onChange={() => setUseCustomStations(true)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Custom List</span>
              </label>
            </div>
            {!useCustomStations ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {DEFAULT_REMOTE_STATIONS.join(', ')}
              </p>
            ) : (
              <textarea
                value={customStations}
                onChange={(e) => setCustomStations(e.target.value)}
                placeholder="One IATA code per line&#10;BCN&#10;IST&#10;DOH"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            )}
          </div>

          {/* Service Types */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Flight Service Types</h3>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SERVICE_TYPES.map(serviceType => (
                <button
                  key={serviceType}
                  onClick={() => toggleServiceType(serviceType)}
                  className={`px-3 py-1 rounded-md font-medium ${
                    selectedServiceTypes.includes(serviceType)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {serviceType}
                </button>
              ))}
            </div>
          </div>

          {/* Aircraft Registrations */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Aircraft Registrations (REG)</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_REGISTRATIONS.map(reg => (
                <button
                  key={reg}
                  onClick={() => toggleRegistration(reg)}
                  className={`px-3 py-1 rounded-md font-medium font-mono text-sm ${
                    selectedRegistrations.includes(reg)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Registrations (one per line)
            </label>
            <textarea
              value={customRegistrations}
              onChange={(e) => setCustomRegistrations(e.target.value)}
              placeholder="e.g.&#10;TC-ABC&#10;D-EFGH"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {registrationsList.length} registrations</p>
          </div>

          {/* Distribution & Ground Time */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Distribution Mode
                </label>
                <select
                  value={distributionMode}
                  onChange={(e) => setDistributionMode(e.target.value as DistributionMode)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Uniform">Uniform</option>
                  <option value="Peak">Peak (06:00-10:00, 17:00-22:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Ground Time (min)
                </label>
                <input
                  type="number"
                  value={minGroundTime}
                  onChange={(e) => setMinGroundTime(parseInt(e.target.value) || 0)}
                  min={30}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Ground Time (min)
                </label>
                <input
                  type="number"
                  value={maxGroundTime}
                  onChange={(e) => setMaxGroundTime(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Seed & Preview Limit */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seed (optional, for deterministic results)
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g., myseed123"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preview Limit (rows shown in table)
              </label>
              <input
                type="number"
                value={previewLimit}
                onChange={(e) => setPreviewLimit(parseInt(e.target.value) || 1000)}
                min={1}
                max={10000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Ground for Link (min)
              </label>
              <input
                type="number"
                value={minGroundTimeForLink}
                onChange={(e) => setMinGroundTimeForLink(parseInt(e.target.value) || 30)}
                min={30}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">For link matching only</p>
            </div>
          </div>

          {/* API Post Section */}
          <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="apiEnabled"
                checked={apiEnabled}
                onChange={(e) => setApiEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="apiEnabled" className="text-lg font-medium text-gray-900 dark:text-white">
                POST to API after generation (optional)
              </label>
            </div>
            
            {apiEnabled && (
              <div className="space-y-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="https://api.example.com/v1/flights/bulk"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bearer Token
                  </label>
                  <input
                    type="password"
                    value={apiBearerToken}
                    onChange={(e) => setApiBearerToken(e.target.value)}
                    placeholder="Your API token"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={apiBatchSize}
                    onChange={(e) => setApiBatchSize(parseInt(e.target.value) || 500)}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">3 retries with exponential backoff</p>
                </div>
                {postProgress && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{postProgress}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isPosting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Preview'}
            </button>
            <button
              onClick={handleExportDaily}
              disabled={flights.length === 0 || isPosting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors"
            >
              Download Daily (.xlsx)
            </button>
            <button
              onClick={handleExportLink}
              disabled={flights.length === 0 || isPosting}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors"
            >
              Download Link (from Daily)
            </button>
          </div>
          
          {flights.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>💡 <strong>Daily:</strong> Long format (one row per flight)</p>
              <p>💡 <strong>Link:</strong> Wide format (one row per arrival-departure pair)</p>
            </div>
          )}
        </div>

        {/* Data Table */}
        {flights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generated Flights ({flights.length} total, showing {Math.min(previewLimit, flights.length)})
              </h2>
            </div>

            {/* Filters */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Airline
                </label>
                <select
                  value={filterAirline}
                  onChange={(e) => {
                    setFilterAirline(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Airlines</option>
                  {uniqueAirlines.map(airline => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Station
                </label>
                <select
                  value={filterStation}
                  onChange={(e) => {
                    setFilterStation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Stations</option>
                  {uniqueStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      onClick={() => handleSort('Airline')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Airline {sortColumn === 'Airline' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('Operator Flight Number')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      FLN {sortColumn === 'Operator Flight Number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('Flight Suffix')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      FLX {sortColumn === 'Flight Suffix' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('Station')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Station {sortColumn === 'Station' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('SDT')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      SDT {sortColumn === 'SDT' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      STA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      STD
                    </th>
                    <th
                      onClick={() => handleSort('REG')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      REG {sortColumn === 'REG' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      onClick={() => handleSort('Flight Service Type')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Service {sortColumn === 'Flight Service Type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedFlights.map((flight, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight.Airline}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight['Operator Flight Number']}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight['Flight Suffix'] || 'O'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight.Station}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight.SDT}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {flight.STA || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {flight.STD || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                        {flight.REG}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {flight['Flight Service Type']}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

