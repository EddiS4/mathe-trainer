import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Confetti from "react-confetti";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";

const NiceButton = styled("button")(({ theme, color = "#1976d2" }) => ({
  background: `linear-gradient(90deg, ${color}, ${shadeColor(color, -25)})`,
  color: "#fff",
  border: "none",
  padding: "12px 28px",
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "transform 0.12s ease, box-shadow 0.12s ease",
  ":hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  },
}));

// Helper: Farbe etwas abdunkeln
function shadeColor(hex, percent) {
  // hex like "#1976d2"
  let c = hex.substring(1);
  const num = parseInt(c, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ------------------------------
// Haupt-Komponente
// ------------------------------
export default function App() {
  // Aufgabe
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState("+");

  // Antwort, Fokus
  const [answer, setAnswer] = useState("");
  const inputRef = useRef(null);

  // Statistik
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [wrongList, setWrongList] = useState([]);

  // Zeit
  const [startTs] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Confetti
  const [celebrate, setCelebrate] = useState(false);

  // Layout / viewport (für Confetti-Größe)
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTs) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [startTs]);

  // neue Aufgabe generieren und Fokus setzen
  const generate = () => {
    const x = Math.floor(Math.random() * 100) + 1; // 1..100
    const y = Math.floor(Math.random() * 100) + 1;
    const operator = Math.random() > 0.5 ? "+" : "-";
    // bei Subtraktion sorgen, dass Ergebnis nicht negativ
    if (operator === "-" && y > x) {
      setA(y);
      setB(x);
    } else {
      setA(x);
      setB(y);
    }
    setOp(operator);
    setAnswer("");
    // Fokus leicht verzögert, damit DOM ready ist
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  // beim Start
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prüfen
  const check = () => {
    if (answer === "" && answer !== 0) {
      // keine Eingabe -> nichts tun
      return;
    }
    const correctResult = op === "+" ? a + b : a - b;
    setTotal((t) => t + 1);

    const parsed = Number(answer);
    if (Number.isFinite(parsed) && parsed === correctResult) {
      setCorrect((c) => c + 1);
      // sichtbare Belohnung
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    } else {
      setWrong((w) => w + 1);
      setWrongList((prev) => [
        { id: prev.length + 1, task: `${a} ${op} ${b}`, correct: correctResult, given: answer ?? "—" },
        ...prev,
      ]);
    }

    generate();
  };

  // Enter-Taste
  const onKeyDown = (e) => {
    if (e.key === "Enter") check();
  };

  // Zeit formatieren mm:ss
  const fmt = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(180deg,#eef7ff,#dceeff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        boxSizing: "border-box",
        gap: 6,
      }}
    >
      {/* Confetti (sichtbar, groß) */}
      {celebrate && (
        <Confetti width={viewport.w} height={viewport.h} numberOfPieces={700} recycle={false} gravity={0.25} />
      )}

      {/* Rechts oben - Panel mit Zeit & Stats */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          px: 3,
          py: 2,
          borderRadius: 2,
          textAlign: "center",
          minWidth: 200,
          backdropFilter: "blur(6px)",
          backgroundColor: "#ffffffdd",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          ⏱ Zeit
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {fmt(elapsed)}
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "success.main" }}>
          ✅ Richtig
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {correct}
        </Typography>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main" }}>
          ❌ Falsch
        </Typography>
        <Typography variant="h6">{wrong}</Typography>
      </Paper>

      {/* Hauptbereich: Aufgaben-Card + Sidebar */}
      <Grid container spacing={4} justifyContent="center" alignItems="flex-start" sx={{ maxWidth: 1200 }}>
        {/* Links: große Aufgabenkarte */}
        <Grid item xs={12} md={7}>
          <Paper elevation={8} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ color: "#1565c0", fontWeight: 800 }}>
                  Mathe-Trainer
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1 }}>
                  Addition & Subtraktion — Zahlen bis 100
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Aufgabe {total + 1}
                </Typography>

                <Box sx={{ my: 3 }}>
                  <Typography variant="h2" sx={{ fontWeight: 900 }}>
                    {a} {op} {b} = ?
                  </Typography>
                </Box>

                <TextField
                  inputRef={inputRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={onKeyDown}
                  variant="outlined"
                  size="medium"
                  type="number"
                  placeholder="Deine Antwort"
                  inputProps={{ style: { textAlign: "center", fontSize: 24 }, autoFocus: true }}
                  sx={{
                    width: { xs: "240px", md: "320px" },
                    mb: 2,
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
                  <NiceButton onClick={check} color="#2e7d32" title="Prüfen (Enter)">
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon sx={{ fontSize: 20 }} /> Prüfen
                    </Box>
                  </NiceButton>

                  <NiceButton onClick={generate} color="#1565c0" title="Neue Aufgabe">
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                      <RefreshIcon sx={{ fontSize: 20 }} /> Nächste Aufgabe
                    </Box>
                  </NiceButton>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
                  Fortschritt
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={total > 0 ? (correct / total) * 100 : 0}
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="body2">Gesamt: {total}</Typography>
                  <Typography variant="body2">
                    Treffer: {total > 0 ? Math.round((correct / total) * 100) : 0}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Rechts: Fehlerliste und Details */}
        <Grid item xs={12} md={5}>
          <Paper elevation={6} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: "#d32f2f" }}>
              Falsche Antworten
            </Typography>

            {wrongList.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Noch keine falschen Antworten — weiter so!
              </Typography>
            ) : (
              <List sx={{ maxHeight: "54vh", overflowY: "auto" }}>
                {wrongList.map((it) => (
                  <ListItem key={it.id} divider>
                    <ListItemText
                      primary={`${it.task} = ${it.correct}`}
                      secondary={`Dein Ergebnis: ${it.given}`}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              {/*<NiceButton
                color="#ed6c02"
                onClick={() => {
                  // Reset Statistik (beibehaltung current task)
                  setTotal(0);
                  setCorrect(0);
                  setWrong(0);
                  setWrongList([]);
                }}
              >
                Statistik zurücksetzen
              </NiceButton>

              <NiceButton
                color="#9c27b0"
                onClick={() => {
                  setElapsed(0);
                }}
              >
                Reset Timer
              </NiceButton>*/}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
