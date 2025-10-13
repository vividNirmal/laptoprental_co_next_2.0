"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Global state to manage which dropdown is currently active
let activeDropdownId = null;
const dropdownListeners = new Set();

export default function SearchDropdown({
  placeholder,
  value,
  onChange,
  onSelect,
  fetchData,
  renderItem,
  renderItemText,
  icon: Icon,
  className = "",
  debounceMs = 500,
  minQueryLength = 0,
  showOnFocus = true,
  hideOnSelect = true,
  emptyMessage = "No results found",
  loadingMessage = "Searching...",
  initialData = null,
  instanceId = Math.random().toString(36).substr(2, 9), // Unique instance ID
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(value || "");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const cacheRef = useRef({});

  // Register this dropdown with global manager
  useEffect(() => {
    const closeDropdown = () => {
      if (activeDropdownId !== instanceId) {
        setIsOpen(false);
      }
    };
    
    dropdownListeners.add(closeDropdown);
    return () => dropdownListeners.delete(closeDropdown);
  }, [instanceId]);

  // Clear global state when this dropdown closes
  useEffect(() => {
    if (!isOpen && activeDropdownId === instanceId) {
      activeDropdownId = null;
    }
  }, [isOpen, instanceId]);

  // Sync internal query with external value
  useEffect(() => {
    if (value !== query) {
      setQuery(value || "");
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (!showOnFocus && query.length < minQueryLength) {
      setData([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.length >= minQueryLength || showOnFocus) {
        const cacheKey = query || '__empty__';
        if (cacheRef.current.hasOwnProperty(cacheKey)) {
          setData(cacheRef.current[cacheKey]);
          setIsOpen(activeDropdownId === instanceId);
          setLoading(false);
        } else {
          setLoading(true);
          try {
            const result = await fetchData(query);
            cacheRef.current[cacheKey] = result || [];
            setData(result || []);
            setIsOpen(activeDropdownId === instanceId);
          } catch (error) {
            console.error("Search error:", error);
            setData([]);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setData([]);
        setIsOpen(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, fetchData, debounceMs, minQueryLength, showOnFocus, instanceId]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (activeDropdownId === instanceId) {
          activeDropdownId = null;
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }
  }, [isOpen, instanceId]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);

    if (activeDropdownId !== instanceId) {
      dropdownListeners.forEach(listener => listener());
      activeDropdownId = instanceId;
    }

    if (newValue.length >= minQueryLength || showOnFocus) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [onChange, minQueryLength, showOnFocus, instanceId]);

  const handleFocus = useCallback((e) => {
    e.stopPropagation();

    if (activeDropdownId !== instanceId) {
      dropdownListeners.forEach(listener => listener());
      activeDropdownId = instanceId;
    }

    if (showOnFocus) {
      setIsOpen(true);
      if (query.length >= minQueryLength || initialData) {
        const cacheKey = query || '__empty__';
        if (cacheRef.current[cacheKey]) {
          setData(cacheRef.current[cacheKey]);
        } else {
          fetchData(query).then(result => {
            cacheRef.current[cacheKey] = result || [];
            if (activeDropdownId === instanceId) {
              setData(result || []);
            }
          }).catch(() => setData([]));
        }
      }
    }
  }, [showOnFocus, query, minQueryLength, fetchData, initialData, instanceId]);

  const handleBlur = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setTimeout(() => {
        setIsOpen(false);
        if (activeDropdownId === instanceId) {
          activeDropdownId = null;
        }
      }, 150);
    }
  }, [instanceId]);

  const handleItemSelect = useCallback((item) => {
    const displayText = renderItemText ? renderItemText(item) : item;
    setQuery(displayText);
    onChange?.(displayText);
    onSelect?.(item);

    if (hideOnSelect) {
      setIsOpen(false);
      inputRef.current?.blur();
      if (activeDropdownId === instanceId) {
        activeDropdownId = null;
      }
    }
  }, [onChange, onSelect, renderItemText, hideOnSelect, instanceId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      if (activeDropdownId === instanceId) {
        activeDropdownId = null;
      }
    } else if (e.key === "ArrowDown" && data.length > 0) {
      e.preventDefault();
    }
  }, [data.length, instanceId]);

  return (
    <div className="relative w-full" ref={dropdownRef} data-dropdown-instance={instanceId}>
      <div className="relative w-full">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 h-4 w-4" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`border-gray-200 rounded-lg ${Icon ? 'pl-10' : ''} ${className}`}
          data-dropdown-instance={instanceId}
          {...props}
        />
      </div>

      {isOpen && (
        <div 
          className="absolute top-[calc(100%_+_5px)] bg-white p-2 rounded-xl shadow-2xl w-full max-h-96 overflow-auto z-20 border border-solid border-[#007bff] xl:min-w-80"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          <ul className="list-none flex flex-col gap-1">
            {loading ? (
              <li className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">{loadingMessage}</span>
              </li>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal whitespace-normal text-left py-2 h-auto hover:bg-gray-100 hover:border-gray-200"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => handleItemSelect(item)}
                  >
                    {renderItem ? renderItem(item) : renderItemText(item)}
                  </Button>
                </li>
              ))
            ) : query.length >= minQueryLength ? (
              <li className="text-sm text-gray-500 px-3 py-4 text-center">
                {emptyMessage}
              </li>
            ) : (
              <li className="text-sm text-gray-500 px-3 py-4 text-center">
                {showOnFocus ? "Start typing to search..." : `Type at least ${minQueryLength} characters...`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}