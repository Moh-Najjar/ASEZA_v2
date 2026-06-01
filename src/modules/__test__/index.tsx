import { useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// THE DEBOUNCE PROBLEM IN REACT
//
// Scenario: user types in a search box → we want to call the API
// only after they STOP typing for 500ms (debounce).
//
// The bug: every render creates a NEW debounced function,
// which resets the 500ms timer → the API call NEVER fires.
// ─────────────────────────────────────────────────────────────

// Simple debounce utility (no lodash needed)
const debounce = <T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number
) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: T) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};


const TestComponent = () => {
    const [query, setQuery] = useState<string>("");
    const [brokenLog, setBrokenLog] = useState<string[]>([]);
    const [fixedLog, setFixedLog] = useState<string[]>([]);

    // ── ❌ BROKEN ────────────────────────────────────────────
    // A new debounced function is created on EVERY render.
    // Every keystroke triggers a re-render → new function → timer resets
    // → the inner callback NEVER runs.
    const brokenSearch = debounce((value: string) => {
        setBrokenLog(prev => [...prev, `API called with: "${value}"`]);
    }, 800);

    // ── ✅ FIXED ─────────────────────────────────────────────
    // useCallback keeps the SAME debounced function reference.
    // The timer is never reset by re-renders → fires correctly after 800ms.
    const fixedSearch = useCallback(
        debounce((value: string) => {
            setFixedLog(prev => [...prev, `API called with: "${value}"`]);
        }, 800),
        [] // created once, never recreated
    );

    const handleChange = (value: string) => {
        setQuery(value);
        brokenSearch(value); // ❌ always resets — will never fire
        fixedSearch(value);  // ✅ stable ref — fires 800ms after last keystroke
    };

    return (
        <div style={{ fontFamily: "monospace", padding: "24px", maxWidth: "480px" }}>
            <h3>Debounce Problem Demo</h3>
            <p style={{ color: "#555", fontSize: "13px" }}>
                Type fast in the box below and watch which side actually calls the API.
            </p>

            <input
                value={query}
                onChange={e => handleChange(e.target.value)}
                placeholder="Type something..."
                style={{ width: "100%", padding: "8px", fontSize: "14px", marginBottom: "20px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                {/* BROKEN */}
                <div>
                    <p style={{ color: "crimson", fontWeight: "bold" }}>
                        ❌ Broken (no useCallback)
                    </p>
                    <p style={{ fontSize: "12px", color: "#888" }}>
                        New debounced fn every render → timer always resets → never fires
                    </p>
                    <div style={{ background: "#fff0f0", padding: "8px", minHeight: "80px", fontSize: "12px" }}>
                        {brokenLog.length === 0
                            ? <span style={{ color: "#aaa" }}>nothing yet...</span>
                            : brokenLog.map((entry, i) => <div key={i}>{entry}</div>)
                        }
                    </div>
                    <button onClick={() => setBrokenLog([])}>clear</button>
                </div>

                {/* FIXED */}
                <div>
                    <p style={{ color: "green", fontWeight: "bold" }}>
                        ✅ Fixed (useCallback)
                    </p>
                    <p style={{ fontSize: "12px", color: "#888" }}>
                        Same fn reference → timer survives re-renders → fires correctly
                    </p>
                    <div style={{ background: "#f0fff0", padding: "8px", minHeight: "80px", fontSize: "12px" }}>
                        {fixedLog.length === 0
                            ? <span style={{ color: "#aaa" }}>nothing yet...</span>
                            : fixedLog.map((entry, i) => <div key={i}>{entry}</div>)
                        }
                    </div>
                    <button onClick={() => setFixedLog([])}>clear</button>
                </div>

            </div>
        </div>
    );
};

export default TestComponent;
