# Flight Data Generator

A React + TypeScript application for generating realistic flight data with turn-around (arrival/departure) pairs for testing and development purposes.

## Features

- **Turn-around Flight Generation**: Generate pairs of flights (ARR + DEP) with realistic ground times
- **Date Range Control**: Specify start/end datetime with Local or UTC timezone
- **Customizable Airlines**: Select from default airlines or add custom ones
- **Remote Stations**: Use default IATA codes or provide your own list
- **Flight Service Types**: Configure service types (J, D, C, P, etc.)
- **Distribution Modes**:
  - **Uniform**: Even distribution across the time range
  - **Peak**: Higher concentration during peak hours (06:00-10:00, 17:00-22:00)
- **Ground Time Control**: Set min/max ground time between arrival and departure (minutes)
- **Deterministic Generation**: Optional seed for reproducible results
- **Data Preview**: Interactive table with sorting, filtering, and pagination
- **Excel Export**: Download generated data as `.xlsx` file
- **API Integration**: Optional batch POST to external API with retry logic

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **dayjs** for date/time handling (with UTC/timezone plugins)
- **SheetJS (xlsx)** for Excel export
- **uuid** for generating unique pair identifiers

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 🚀 Hızlı Başlatma (Windows)

Proje dizininde 3 farklı başlatma scripti bulunur:

#### 1. **run.bat** (Önerilen)
En basit kullanım - çift tıklayın veya:
```cmd
run.bat
```

#### 2. **start-dev.ps1** (PowerShell - Gelişmiş)
PowerShell ile daha detaylı kontrol:
```powershell
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

#### 3. **start-dev.bat** (Klasik Batch)
```cmd
start-dev.bat
```

**Tüm scriptler otomatik olarak:**
- ✅ Port 5173'ü kontrol eder
- ✅ Port meşgulse otomatik boşaltır
- ✅ node_modules yoksa yükler
- ✅ Geliştirme sunucusunu başlatır

## Usage

### Access the Application

Navigate to `/tools/flight-generator` in your browser. When running the dev server, this is typically:
```
http://localhost:5173/tools/flight-generator
```

### Configuration Options

#### Date Range
- **Start Datetime**: Beginning of the time range
- **End Datetime**: End of the time range (max 31 days from start)
- **Timezone Mode**: Local or UTC

#### Home Airport
- 3-letter IATA code (e.g., ADB)
- Automatically filtered from remote stations

#### Number of Pairs
- Range: 1-10,000
- Each pair generates 2 flights (ARR + DEP)

#### Airlines
- Select from default list: AJ, TK, PC, LH, SU, QR, FZ, W6
- Add custom airlines (comma-separated)

#### Flight Number Range
- Min: Default 100
- Max: Default 3999
- Random numbers generated within this range

#### Remote Stations
- **Default List**: BCN, IST, DOH, SAW, FRA, DXB, AMS, LHR, KWI, MUC, CDG
- **Custom List**: One IATA code per line in textarea

#### Service Types
- Select from: J, D, C, P (default all selected)
- Multiple selection supported

#### Distribution Mode
- **Uniform**: Even time distribution
- **Peak**: 60% of flights during 06:00-10:00 and 17:00-22:00

#### Ground Time
- Min: Default 30 minutes (minimum allowed)
- Max: Default 180 minutes

#### Seed (Optional)
- Enter any string for deterministic results
- Same seed = same output

#### Preview Limit
- Number of rows to show in table (max 10,000)
- Export includes all generated flights

### API Integration (Optional)

Enable POST to API after generation:

1. Check "POST to API after generation"
2. Enter **Endpoint URL** (e.g., `https://api.example.com/v1/flights/bulk`)
3. Enter **Bearer Token** for authentication
4. Set **Batch Size** (default 500)
5. Automatic retry: 3 attempts with exponential backoff

### Data Table Features

- **Sorting**: Click column headers to sort
- **Filtering**: Filter by Airline or Station
- **Pagination**: Choose 10/50/100/1000 rows per page
- **Navigation**: Previous/Next page buttons

### Excel Export

- Click "Download Excel" button
- File naming: `flights_YYYYMMDD_HHmmss_<rowcount>.xlsx`
- Includes all generated flights (not limited by preview)
- Columns:
  - Airline
  - Operator Flight Number
  - Station
  - STAD (DD/MM/YYYY HH:mm:ss)
  - Flight Service Type

## Data Schema

### Generated Flight Fields

```typescript
{
  "Airline": "AJ",                        // 2-3 letter airline code
  "Operator Flight Number": 3308,         // Numeric flight number
  "Station": "BCN-ADB",                   // Origin-Destination IATA codes
  "STAD": "13/10/2025 14:30:00",         // Scheduled Time (DD/MM/YYYY HH:mm:ss)
  "Flight Service Type": "J",             // Service type code
  _pairId: "uuid",                        // Internal: Pair identifier
  _legType: "ARR",                        // Internal: ARR or DEP
  _home: "ADB"                            // Internal: Home airport
}
```

### Turn-around Logic

Each pair generates two flights:

1. **Arrival (ARR)**: `XXX → HOME` (e.g., BCN → ADB)
   - Random time within specified range
   - Follows selected distribution mode

2. **Departure (DEP)**: `HOME → XXX` (e.g., ADB → BCN)
   - Time = ARR time + random ground time
   - Same airline, flight number, and service type
   - Must fit within end datetime

## Validation Rules

- Start datetime must be before end datetime
- Date range cannot exceed 31 days
- Home airport must be exactly 3 letters
- At least 1 pair required (max 10,000)
- At least 1 airline required
- At least 1 remote station required (excluding home)
- All remote stations must be 3 letters
- Min ground time must be at least 30 minutes
- Max ground time must be greater than min

## Project Structure

```
src/
├── types/
│   └── flight.ts                 # Type definitions
├── utils/
│   └── generateFlights.ts        # Core generation logic
├── pages/
│   └── tools/
│       └── FlightGenerator.tsx   # Main component
├── App.tsx                       # Router configuration
├── main.tsx                      # Application entry
└── index.css                     # Tailwind directives
```

## Development

### Branch
Currently on: `feat/flight-data-generator`

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Example Use Cases

1. **Testing**: Generate test data for flight management systems
2. **Development**: Populate development databases with realistic data
3. **Load Testing**: Create large datasets for performance testing
4. **Prototyping**: Quickly generate sample data for UI mockups

## Notes

- All times are formatted as `DD/MM/YYYY HH:mm:ss`
- Station format is always `ORIGIN-DESTINATION`
- Home airport is automatically filtered from remote stations
- If a departure time exceeds the end datetime, the pair is regenerated
- Maximum 100 attempts per pair before skipping

## License

Private/Internal Use

## Author

Built with React + TypeScript for FMS Daily

