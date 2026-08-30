// src/components/AdvancedDateComponent.tsx
"use client";

import { Transition } from '@headlessui/react';
import { useState, Fragment, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Transition as MotionTransition } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateValue } from './PortfolioLayout';

import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react';


function ToggleSwitch({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--color-accent-solid)]' : 'bg-[var(--color-bg-tertiary)]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
        </label>
    );
}

type AdvancedDateComponentProps = {
  startDate: DateValue;
  endDate: DateValue | 'Present';
  onDateChange: (start: DateValue, end: DateValue | 'Present') => void;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentYear = new Date().getFullYear();

function formatDate(date: DateValue | 'Present'): string {
    if (date === 'Present') return 'Present';
    if (!date.year) return '';
    if (date.month) return `${MONTHS[date.month - 1]} ${date.year}`;
    return date.year.toString();
}

type View = 'year' | 'month';
type SelectionStep = 'start' | 'end';

export default function AdvancedDateComponent({ startDate, endDate, onDateChange }: AdvancedDateComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const [view, setView] = useState<View>('year');
  const [gridYearStart, setGridYearStart] = useState(Math.floor(((startDate.year || currentYear) - 9) / 10) * 10);
  const [selectionStep, setSelectionStep] = useState<SelectionStep>('start');
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  useEffect(() => {
    if (isOpen) {
      setTempStart(startDate);
      setTempEnd(endDate);
      setView('year');
      setSelectionStep('start');
      setGridYearStart(Math.floor(((startDate.year || currentYear) - 9) / 10) * 10);
    }
  }, [isOpen, startDate, endDate]);

  const yearsForView = useMemo(() => Array.from({ length: 20 }, (_, i) => gridYearStart + i), [gridYearStart]);

  const handleNextYears = () => {
    if (gridYearStart + 20 < currentYear) {
      setGridYearStart(d => d + 20);
    }
  };
  
  const handlePrevYears = () => setGridYearStart(d => d - 20);

  const moveToNextStep = (newStart: DateValue, newEnd: DateValue | 'Present') => {
    if (selectionStep === 'start') {
      setSelectionStep('end');
      setView('year');
    } else {
      onDateChange(newStart, newEnd);
      setIsOpen(false);
    }
  };

  const handleYearSelect = (year: number) => {
    if (selectionStep === 'start') setTempStart({ year, month: null });
    else setTempEnd({ year, month: null });
    setView('month');
  };

  const handleMonthSelect = (month: number) => {
    const newStart = selectionStep === 'start' ? { ...tempStart, month } : tempStart;
    const newEnd = selectionStep === 'end' ? { ...(tempEnd as DateValue), month } : tempEnd;
    setTempStart(newStart);
    setTempEnd(newEnd);
    moveToNextStep(newStart, newEnd);
  };

  const handleYearOnlySelect = () => {
    const newStart = selectionStep === 'start' ? { ...tempStart, month: null } : tempStart;
    const newEnd = selectionStep === 'end' ? { year: (tempEnd as DateValue).year, month: null } : tempEnd;
    setTempStart(newStart);
    setTempEnd(newEnd);
    moveToNextStep(newStart, newEnd);
  };
  
  const handlePresentToggle = (isChecked: boolean) => {
    const newEnd = isChecked ? 'Present' : { year: currentYear, month: null };
    setTempEnd(newEnd);
    if (selectionStep === 'end') moveToNextStep(tempStart, newEnd);
  };
  
  const displayValue = `${formatDate(startDate) || 'Start Date'} - ${formatDate(endDate) || 'End Date'}`;
  const isPresent = tempEnd === 'Present';

  const renderView = () => {
    const animationProps = {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.15, ease: 'easeOut' } as MotionTransition,
    };
    const selectedYear = selectionStep === 'start' ? tempStart.year : (tempEnd !== 'Present' ? tempEnd.year : null);

    switch (view) {
      case 'year':
        return (
          <motion.div key="year" {...animationProps} className="grid grid-cols-5 gap-2">
            {yearsForView.map(year => {
                const isDisabled = (selectionStep === 'end' && tempStart.year ? year < tempStart.year : false) || year > currentYear;
                return (
                    <button key={year} disabled={isDisabled} onClick={() => handleYearSelect(year)} className={`p-2 text-sm rounded-md ${selectedYear === year ? 'bg-[var(--color-accent-solid)] text-white font-bold' : 'hover:bg-[var(--color-bg-tertiary)]'} ${isDisabled ? 'text-[var(--color-text-muted)]/40 cursor-not-allowed' : ''}`}>{year}</button>
                );
            })}
          </motion.div>
        );
      case 'month':
      default:
        return (
            <motion.div key="month" {...animationProps} className="space-y-3">
                <button onClick={handleYearOnlySelect} className="w-full p-2 text-sm font-bold rounded-md bg-[var(--color-accent-solid)]/80 text-white hover:bg-[var(--color-accent-solid)]">
                    Select Year Only: {(selectionStep === 'start' ? tempStart : (tempEnd as DateValue)).year}
                </button>
                <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map((month, index) => {
                        const monthIndex = index + 1;
                        const isDisabled = selectionStep === 'end' && tempStart.year === (tempEnd as DateValue)?.year && tempStart.month ? monthIndex < tempStart.month : false;
                        return (
                            <button key={month} disabled={isDisabled} onClick={() => handleMonthSelect(monthIndex)} className={`p-2 text-sm rounded-md ${isDisabled ? 'text-[var(--color-text-muted)]/40 cursor-not-allowed' : ''}`}>{month}</button>
                        );
                    })}
                </div>
            </motion.div>
        );
    }
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="w-full flex items-center justify-between bg-[var(--color-bg-primary)] p-2 rounded-md text-sm border border-transparent hover:border-[var(--color-border-primary)] transition-colors"
      >
        <span>{displayValue}</span>
        <CalendarIcon size={16} className="text-[var(--color-text-muted)]" />
      </button>

      <Transition show={isOpen} as={Fragment}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-20 w-80"
        >
          <div className="overflow-hidden rounded-lg shadow-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]">
            <div className="p-3 border-b border-[var(--color-border-primary)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Select Period</h3>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-bold uppercase transition-opacity ${selectionStep === 'start' ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    Start: {formatDate(tempStart)}
                </span>
                <span className={`text-xs font-bold uppercase transition-opacity ${selectionStep === 'end' && !isPresent ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    End: {formatDate(tempEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  {view === 'month' ? (selectionStep === 'start' ? tempStart.year : (tempEnd as DateValue).year) : 'Year'}
                </span>
                {view === 'month' && (
                  <button onClick={() => setView('year')} className="text-sm underline hover:text-[var(--color-accent-primary)]">Change Year</button>
                )}
                <div className={`flex items-center gap-2 ${view === 'month' ? 'opacity-0' : ''}`}>
                  <button onClick={handlePrevYears}><ChevronLeft size={18} /></button>
                  <button onClick={handleNextYears}><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
            <div className="p-3 h-[180px]">
              <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
            </div>
            <div className="p-3 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/50">
              <ToggleSwitch label="Present" checked={isPresent} onChange={handlePresentToggle} />
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
}