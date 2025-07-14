

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { AnalogueClockFace } from './AnalogueClockFace';
import { SwipeToDelete } from './SwipeToDelete';
import { WeatherData, getWeatherForTimezone } from '../utils/weatherApi';
import { getFormattedDate, getDayOffset } from '../utils/date';
import {
  WeatherCloudyIcon,
  WeatherRainyIcon,
  WeatherSnowyIcon,
  WeatherSunnyIcon,
  WeatherThunderstormIcon,
} from './Icons';
import { timezoneCoordinates } from '../data/timezonesWithCoords';
import { fadeThroughVariants } from '../utils/motion';

interface ClockProps {
  timezone: string;
  date: Date;
  isPrimary: boolean;
  onRemove?: (timezone: string) => void;
}

interface TimeValues {
    hour12: string;
    minute: string;
    dayPeriod: string;
    h24: number;
    m: number;
    s: number;
}

interface RotationValues {
  hoursDeg: number;
  minutesDeg: number;
  secondsDeg: number;
}

type WeatherState = {
  loading: boolean;
  data: WeatherData | null;
  error: string | null;
};

// --- Weather Component ---
const WeatherIcon: React.FC<{ condition: WeatherData['condition']; className?: string }> = ({ condition, className = "h-5 w-5" }) => {
  const icons: Record<WeatherData['condition'], React.ReactNode> = {
    Sunny: <WeatherSunnyIcon className={className} />,
    Cloudy: <WeatherCloudyIcon className={className} />,
    Rainy: <WeatherRainyIcon className={className} />,
    Snowy: <WeatherSnowyIcon className={className} />,
    Thunderstorm: <WeatherThunderstormIcon className={className} />,
  };
  return icons[condition] || null;
};

const WeatherSkeletonLoader: React.FC<{ isPrimary: boolean }> = ({ isPrimary }) => {
  const primaryClasses = "h-7 w-44";
  const secondaryClasses = "h-5 w-20";
  return (
    <div className={`animate-pulse bg-outline-variant/20 rounded-lg ${isPrimary ? primaryClasses : secondaryClasses}`} />
  );
};

const WeatherDisplay: React.FC<{ weather: WeatherState; isPrimary: boolean }> = ({ weather, isPrimary }) => {
  const containerStyle = isPrimary ? { minHeight: '36px' } : { minHeight: '24px' };

  return (
    <div className="flex items-center" style={containerStyle}>
      <AnimatePresence mode="wait">
        {weather.loading ? (
          <motion.div key="loader" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            <WeatherSkeletonLoader isPrimary={isPrimary} />
          </motion.div>
        ) : weather.data ? (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            className={`flex items-center gap-2 w-full ${isPrimary ? 'm3-body-large' : 'm3-body-medium'} text-on-surface-variant`}
          >
            <WeatherIcon condition={weather.data.condition} className={`${isPrimary ? 'h-6 w-6 text-primary' : 'h-5 w-5 text-secondary'}`} />
            <span className="font-medium">{weather.data.temperature}°C</span>
            {isPrimary && <span className='opacity-80'>{weather.data.condition}</span>}
          </motion.div>
        ) : (
          <motion.div key="error" />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Refactored Primary Clock Components ---
const PrimaryClockInfo = React.memo(
  ({ cityName, fullDate, weather }: { cityName: string; fullDate: string; weather: WeatherState; }) => (
    <div className="flex flex-col gap-1">
      <p className="m3-title-large text-primary opacity-90 truncate">{cityName}</p>
      <p className="m3-body-large text-on-surface-variant">{fullDate}</p>
      <div className="mt-4">
        <WeatherDisplay weather={weather} isPrimary={true} />
      </div>
    </div>
  )
);

const PrimaryClockContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="widget-surface rounded-[28px] p-6 sm:p-8 shadow-sm flex items-center justify-between gap-4">
    {children}
  </div>
);

const DigitalPrimaryClock = React.memo(
  ({ cityName, fullDate, timeValues, weather }: { cityName: string; fullDate: string; timeValues: { hour: string; minute: string; dayPeriod: string; }; weather: WeatherState; }) => (
    <PrimaryClockContainer>
      <PrimaryClockInfo cityName={cityName} fullDate={fullDate} weather={weather} />
      <div className="flex items-baseline justify-end flex-shrink-0">
        <span className="m3-display-medium sm:m3-display-large lg:m3-display-giant text-primary [font-variant-numeric:tabular-nums]">
          {`${timeValues.hour}:${timeValues.minute}`}
        </span>
        <span className="m3-headline-small sm:m3-headline-medium lg:m3-headline-large ml-2 lg:ml-4 text-primary opacity-80">{timeValues.dayPeriod}</span>
      </div>
    </PrimaryClockContainer>
  )
);

const AnaloguePrimaryClock = React.memo(
  ({ cityName, fullDate, rotations, weather }: { cityName: string; fullDate: string; rotations: RotationValues; weather: WeatherState; }) => (
    <PrimaryClockContainer>
      <PrimaryClockInfo cityName={cityName} fullDate={fullDate} weather={weather} />
      <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
        <AnalogueClockFace {...rotations} />
      </div>
    </PrimaryClockContainer>
  )
);

// --- Refactored Secondary Grid Clock Components ---
const SecondaryGridClockInfo = React.memo(
  ({ dayOffset, weather }: { dayOffset: string; weather: WeatherState }) => (
    <div className="flex flex-col items-center gap-1">
      <p className="m3-body-medium text-on-surface-variant">{dayOffset}</p>
      <WeatherDisplay weather={weather} isPrimary={false} />
    </div>
  )
);

const SecondaryGridClockContainer: React.FC<{ cityName: string, children: React.ReactNode }> = ({ cityName, children }) => (
  <div className="widget-surface rounded-[28px] p-5 flex flex-col items-center text-center gap-2 shadow-sm">
    <p className="m3-title-large text-primary truncate">{cityName}</p>
    {children}
  </div>
);

const DigitalSecondaryGridClock = React.memo(
  ({ cityName, timeValues, dayOffset, weather }: { cityName: string; timeValues: { hour: string; minute: string; dayPeriod: string; }; dayOffset: string; weather: WeatherState; }) => (
    <SecondaryGridClockContainer cityName={cityName}>
      <div className="flex items-baseline justify-center">
        <span className="m3-display-small text-primary [font-variant-numeric:tabular-nums]">{`${timeValues.hour}:${timeValues.minute}`}</span>
        <span className="m3-body-large ml-1.5 text-primary opacity-80">{timeValues.dayPeriod}</span>
      </div>
      <SecondaryGridClockInfo dayOffset={dayOffset} weather={weather} />
    </SecondaryGridClockContainer>
  )
);

const AnalogueSecondaryGridClock = React.memo(
  ({ cityName, dayOffset, rotations, weather }: { cityName: string; dayOffset: string; rotations: RotationValues; weather: WeatherState; }) => (
    <SecondaryGridClockContainer cityName={cityName}>
      <div className="w-28 h-28 my-1">
        <AnalogueClockFace {...rotations} />
      </div>
      <SecondaryGridClockInfo dayOffset={dayOffset} weather={weather} />
    </SecondaryGridClockContainer>
  )
);

// --- Refactored Secondary List Clock Components ---
const ListClockContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="widget-surface rounded-[28px] p-4 flex items-center justify-between gap-4 shadow-sm w-full">
        {children}
    </div>
);

const ListClockInfo = React.memo(
    ({ cityName, dayOffset, weather }: { cityName: string; dayOffset: string; weather: WeatherState; }) => (
        <div className="flex flex-col gap-0">
            <p className="m3-title-medium text-primary opacity-90 truncate">{cityName}</p>
            <p className="m3-body-medium text-on-surface-variant">{dayOffset}</p>
            <div className="mt-1">
                <WeatherDisplay weather={weather} isPrimary={false} />
            </div>
        </div>
    )
);

const DigitalListClock = React.memo(
    ({ cityName, timeValues, dayOffset, weather }: { cityName: string; timeValues: { hour: string; minute: string; dayPeriod: string; }; dayOffset: string; weather: WeatherState; }) => (
        <ListClockContainer>
            <ListClockInfo cityName={cityName} dayOffset={dayOffset} weather={weather} />
            <div className="flex items-baseline justify-end flex-shrink-0">
                <span className="m3-headline-medium text-primary [font-variant-numeric:tabular-nums]">
                    {`${timeValues.hour}:${timeValues.minute}`}
                </span>
                <span className="m3-body-large ml-1.5 text-primary opacity-80">{timeValues.dayPeriod}</span>
            </div>
        </ListClockContainer>
    )
);

const AnalogueListClock = React.memo(
    ({ cityName, dayOffset, rotations, weather }: { cityName: string; dayOffset: string; rotations: RotationValues; weather: WeatherState; }) => (
        <ListClockContainer>
            <ListClockInfo cityName={cityName} dayOffset={dayOffset} weather={weather} />
            <div className="w-20 h-20 flex-shrink-0">
                <AnalogueClockFace {...rotations} />
            </div>
        </ListClockContainer>
    )
);


// --- Main Component ---

export const Clock: React.FC<ClockProps> = ({ timezone, date, isPrimary, onRemove }) => {
  const { clockType, viewType } = useSettings();
  const localTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const [weather, setWeather] = useState<WeatherState>({ loading: true, data: null, error: null });

  // Refs for continuous rotation of hands
  const revolutions = useRef({ h: 0, m: 0, s: 0 });
  const prevTime = useRef<{ h: number | null; m: number | null; s: number | null }>({ h: null, m: null, s: null });
  const prevTimezone = useRef<string>(timezone);

  useEffect(() => {
    let isCancelled = false;
    const fetchWeather = async () => {
      setWeather({ loading: true, data: null, error: null });
      try {
        const weatherData = await getWeatherForTimezone(timezone);
        if (!isCancelled) {
          if(weatherData) {
            setWeather({ loading: false, data: weatherData, error: null });
          } else {
             setWeather({ loading: false, data: null, error: "Could not fetch weather." });
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setWeather({ loading: false, data: null, error: 'Failed to fetch weather' });
        }
      }
    };

    fetchWeather();

    return () => {
      isCancelled = true;
    };
  }, [timezone]);


  const timeValues: TimeValues = useMemo(() => {
    const opts24: Intl.DateTimeFormatOptions = { timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    const opts12: Intl.DateTimeFormatOptions = { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true };

    try {
        const parts24 = new Intl.DateTimeFormat('en-US', opts24).formatToParts(date);
        const parts12 = new Intl.DateTimeFormat('en-US', opts12).formatToParts(date);
        
        const p24 = new Map(parts24.map(p => [p.type, p.value]));
        const p12 = new Map(parts12.map(p => [p.type, p.value]));
        
        let h24_val = parseInt(p24.get('hour') || '0', 10);
        if (h24_val === 24) h24_val = 0;

        return {
            hour12: p12.get('hour') || '0',
            minute: p12.get('minute') || '00',
            dayPeriod: p12.get('dayPeriod') || '',
            h24: isNaN(h24_val) ? 0 : h24_val,
            m: parseInt(p24.get('minute') || '0', 10),
            s: parseInt(p24.get('second') || '0', 10),
        };
    } catch(e) {
        console.error("Invalid timezone for time calculation:", timezone);
        return { hour12: '--', minute: '--', dayPeriod: '', h24: 0, m: 0, s: 0 };
    }
  }, [date, timezone]);

  // This is the core of the fix. It runs on every render, which is every second.
  // We use refs to persist values across renders without causing extra re-renders.
  
  // 1. Reset if the timezone prop changes.
  if (timezone !== prevTimezone.current) {
    revolutions.current = { h: 0, m: 0, s: 0 };
    prevTime.current = { h: null, m: null, s: null };
    prevTimezone.current = timezone;
  }
  
  // 2. Detect when hands wrap around and add a revolution.
  if (prevTime.current.s !== null && timeValues.s < prevTime.current.s) {
    revolutions.current.s++;
  }
  if (prevTime.current.m !== null && timeValues.m < prevTime.current.m) {
    revolutions.current.m++;
  }
  // For hours, we check the 12-hour cycle.
  if (prevTime.current.h !== null && (timeValues.h24 % 12) < (prevTime.current.h % 12)) {
    revolutions.current.h++;
  }
  
  // 3. Store the current time for the next render's comparison.
  prevTime.current = { h: timeValues.h24, m: timeValues.m, s: timeValues.s };

  const rotations = useMemo(() => {
    const { h24, m, s } = timeValues;
    
    // 4. Calculate degrees, incorporating the full revolutions.
    const secondsDeg = (revolutions.current.s * 360) + s * 6;
    const minutesDeg = (revolutions.current.m * 360) + m * 6 + s * 0.1;
    // The hour hand completes one revolution in 12 hours (360 degrees).
    const hoursDeg = (revolutions.current.h * 360) + (h24 % 12) * 30 + m * 0.5;
    
    return { secondsDeg, minutesDeg, hoursDeg };
  }, [timeValues]);

  const fullDate = useMemo(() => getFormattedDate(date, timezone), [date, timezone]);
  const dayOffset = useMemo(() => getDayOffset(date, localTimezone, timezone), [date, localTimezone, timezone]);
  const cityName = useMemo(() => timezoneCoordinates[timezone]?.city || timezone.split('/').pop()?.replace(/_/g, ' ') || 'Unknown', [timezone]);

  const renderContent = () => {
    const digitalTime = { hour: timeValues.hour12, minute: timeValues.minute, dayPeriod: timeValues.dayPeriod };

    if (isPrimary) {
      const commonPrimaryProps = { cityName, weather, fullDate };
      return clockType === 'analogue'
        ? <AnaloguePrimaryClock {...commonPrimaryProps} rotations={rotations} />
        : <DigitalPrimaryClock {...commonPrimaryProps} timeValues={digitalTime} />;
    } else {
      const commonSecondaryProps = { cityName, dayOffset, weather };
      let secondaryClock;

      if (viewType === 'list') {
         secondaryClock = clockType === 'analogue'
            ? <AnalogueListClock {...commonSecondaryProps} rotations={rotations} />
            : <DigitalListClock {...commonSecondaryProps} timeValues={digitalTime} />;
      } else {
        secondaryClock = clockType === 'analogue'
            ? <AnalogueSecondaryGridClock {...commonSecondaryProps} rotations={rotations} />
            : <DigitalSecondaryGridClock {...commonSecondaryProps} timeValues={digitalTime} />;
      }

      return (
        <SwipeToDelete onDelete={() => onRemove && onRemove(timezone)}>
          {secondaryClock}
        </SwipeToDelete>
      )
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${clockType}-${isPrimary ? 'primary' : viewType}`}
        variants={fadeThroughVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="will-change-[transform,opacity]"
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};