import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Paper, Box, Button, LinearProgress, Grid } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Confetti from "react-confetti";

function App() {
  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashColor, setFlashColor] = useState(false);
  const [stars, setStars] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);

  const answerRef = useRef(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Always show on-screen keypad
  useEffect(() => {
    setShowKeypad(true);
  }, []);

  // Fokus auf Eingabe (only focus if not forcing readOnly)
  useEffect(() => {
    if (!showKeypad && answerRef.current) answerRef.current.focus();
  }, [question, showKeypad]);

  function generateQuestion() {
    const rand = Math.random();
    let op, a, b;

    if (rand < 0.33) {
      op = "+";
      a = Math.floor(Math.random() * 101);
      b = Math.floor(Math.random() * 101);
    } else if (rand < 0.66) {
      op = "-";
      a = Math.floor(Math.random() * 101);
      b = Math.floor(Math.random() * (a + 1)); // Keine negativen Ergebnisse
    } else {
      op = "×";
      a = Math.floor(Math.random() * 10); // Single digit (0-9)
      b = Math.floor(Math.random() * 10); // Single digit (0-9)
    }
    return { a, b, op };
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function spawnStars() {
    const newStars = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
      top: 0,
      rotation: Math.random() * 360,
    }));
    setStars(newStars);
    setTimeout(() => setStars([]), 1500);
  }

  function markCorrected(index) {
    const newList = [...wrongAnswers];
    newList[index].corrected = true;
    newList[index].repeat = false;
    setWrongAnswers(newList);
  }

  function handleRepeat(index) {
    const item = wrongAnswers[index];
    setQuestion({ a: item.a, b: item.b, op: item.op });

    const newList = [...wrongAnswers];
    newList[index].repeat = true;
    setWrongAnswers(newList);
  }

  function handleSubmit() {
    if (answer === "" || answer === "-") return;
    const userAnswer = parseInt(answer, 10);
    let correctAnswer;
    if (question.op === "+") {
      correctAnswer = question.a + question.b;
    } else if (question.op === "-") {
      correctAnswer = question.a - question.b;
    } else if (question.op === "×") {
      correctAnswer = question.a * question.b;
    }

    // Prüfe, ob die aktuelle Frage aus der falschen Liste kommt
    const repeatIndex = wrongAnswers.findIndex(
      (item) => item.repeat && item.a === question.a && item.b === question.b && item.op === question.op
    );

    if (userAnswer === correctAnswer) {
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setFlashColor(true);
      spawnStars();
      setTimeout(() => {
        setShowConfetti(false);
        setFlashColor(false);
      }, 2000);

      // Wenn es eine wiederholte Aufgabe war, markiere sie als korrigiert
      if (repeatIndex !== -1) {
        markCorrected(repeatIndex);
      }
    } else {
      // Wenn die Aufgabe nicht bereits in der falschen Liste ist, hinzufügen
      if (repeatIndex === -1) {
        setWrongAnswers((prev) => [...prev, { ...question, userAnswer, repeat: false, corrected: false }]);
      }
    }

    setQuestion(generateQuestion());
    setAnswer("");
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") handleSubmit();
  }

  // Keypad handling
  function handleKeypadInput(key) {
    setAnswer((prev) => {
      if (key === "clear") return "";
      if (key === "del") return prev.slice(0, -1);
      if (key === "sign") {
        if (!prev) return "-";
        return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
      }
      if (key === "enter") {
        // use current value (submit handled outside setState), return prev unchanged
        setTimeout(() => handleSubmit(), 0);
        return prev;
      }
      // digits
      if (key >= "0" && key <= "9") {
        // Prevent leading zeros like "00"
        if (prev === "0") return key;
        return (prev || "") + key;
      }
      return prev;
    });
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: 4,
          backgroundColor: flashColor ? "#e0ffe0" : "#fff",
          transition: "background-color 0.5s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sterne */}
        {stars.map((star) => (
          <Box
            key={star.id}
            sx={{
              position: "absolute",
              left: `${star.left}%`,
              top: 0,
              fontSize: "2rem",
              transform: `rotate(${star.rotation}deg)`,
              animation: "fall 1.5s ease-out forwards",
              zIndex: 10,
            }}
          >
            ⭐
          </Box>
        ))}

        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
          Mathematik-Trainer 🎯
        </Typography>

        {/* Frage */}
        <Box display="flex" justifyContent="center" my={3}>
          <Paper sx={{ p: 3, minWidth: 200, textAlign: "center", boxShadow: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {question.a} {question.op} {question.b} = ?
            </Typography>
          </Paper>
        </Box>

        {/* Eingabe */}
        <Box display="flex" justifyContent="center" gap={2} mb={3} flexWrap="wrap">
          <input
            type="text"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={answerRef}
            readOnly={showKeypad}
            aria-label="Antwort"
            style={{
              padding: "10px 15px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "2px solid #1976d2",
              width: "360px",
              textAlign: "center",
              backgroundColor: showKeypad ? "#fafafa" : undefined,
            }}
          />
        </Box>

        {/* On-screen numpad for touch/tablet */}
        {showKeypad && (
          <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: "100%", maxWidth: 400 }}>
              <Grid container spacing={1}>
                <Grid item size={12}>
                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                      height: 60,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #da70d6 0%, #ff6b9d 100%)",
                      "&:hover": { background: "linear-gradient(135deg, #c855c1 0%, #dd5a8a 100%)" },
                      "&:active": { transform: "scale(0.95)" },
                      color: "white",
                      padding: 0,
                    }}
                    disabled={answer === "" || answer === "-"}
                  >
                    Antwort Prüfen
                  </Button>
                </Grid>

                {[1, 2, 3].map((num) => (
                  <Grid item size={4} key={num}>
                    <Button
                      fullWidth
                      onClick={() => handleKeypadInput(num.toString())}
                      variant="contained"
                      sx={{
                        height: 60,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        textTransform: "none",
                        background: "linear-gradient(135deg, #4da6ff 0%, #2980ff 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #2980ff 0%, #1e5fa0 100%)" },
                        "&:active": { transform: "scale(0.95)" },
                        color: "white",
                        padding: 0,
                      }}
                    >
                      {num}
                    </Button>
                  </Grid>
                ))}
                {/* Row 2: 4 5 6 */}
                {[4, 5, 6].map((num) => (
                  <Grid item size={4} key={num}>
                    <Button
                      fullWidth
                      onClick={() => handleKeypadInput(num.toString())}
                      variant="contained"
                      sx={{
                        height: 60,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        textTransform: "none",
                        background: "linear-gradient(135deg, #4da6ff 0%, #2980ff 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #2980ff 0%, #1e5fa0 100%)" },
                        "&:active": { transform: "scale(0.95)" },
                        color: "white",
                        padding: 0,
                      }}
                    >
                      {num}
                    </Button>
                  </Grid>
                ))}
                {/* Row 3: 7 8 9 */}
                {[7, 8, 9].map((num) => (
                  <Grid item size={4} key={num}>
                    <Button
                      fullWidth
                      onClick={() => handleKeypadInput(num.toString())}
                      variant="contained"
                      sx={{
                        height: 60,
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        borderRadius: "12px",
                        textTransform: "none",
                        background: "linear-gradient(135deg, #4da6ff 0%, #2980ff 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #2980ff 0%, #1e5fa0 100%)" },
                        "&:active": { transform: "scale(0.95)" },
                        color: "white",
                        padding: 0,
                      }}
                    >
                      {num}
                    </Button>
                  </Grid>
                ))}

                <Grid item size={4}>
                  <Button
                    fullWidth
                    onClick={() => handleKeypadInput("clear")}
                    variant="contained"
                    sx={{
                      height: 60,
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #ff9933 0%, #ff7700 100%)",
                      "&:hover": { background: "linear-gradient(135deg, #ff7700 0%, #dd6600 100%)" },
                      "&:active": { transform: "scale(0.95)" },
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      padding: 0,
                    }}
                  >
                    <span>✕</span> Löschen
                  </Button>
                </Grid>

                <Grid item size={4}>
                  <Button
                    fullWidth
                    onClick={() => handleKeypadInput("0")}
                    variant="contained"
                    sx={{
                      height: 60,
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #4da6ff 0%, #2980ff 100%)",
                      "&:hover": { background: "linear-gradient(135deg, #2980ff 0%, #1e5fa0 100%)" },
                      "&:active": { transform: "scale(0.95)" },
                      color: "white",
                      padding: 0,
                    }}
                  >
                    0
                  </Button>
                </Grid>

                {/* Row 3: Delete | Submit */}
                <Grid item size={4}>
                  <Button
                    fullWidth
                    onClick={() => handleKeypadInput("del")}
                    variant="contained"
                    sx={{
                      height: 60,
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                      "&:hover": { background: "linear-gradient(135deg, #ee5a52 0%, #cc4444 100%)" },
                      "&:active": { transform: "scale(0.95)" },
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    aria-label="Löschen"
                  >
                    ⌫
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Fortschritt */}
        <Box>
          <Typography variant="h6">Fortschritt</Typography>
          <Typography>
            ✅ Richtig: {correctCount} | ❌ Falsch: {wrongAnswers.length} | Gesamt: {correctCount + wrongAnswers.length}
          </Typography>
          <Typography sx={{ mt: 1 }}>⏱ Zeit: {formatTime(elapsedTime)}</Typography>
          <LinearProgress
            variant="determinate"
            value={
              correctCount + wrongAnswers.length > 0 ? (correctCount / (correctCount + wrongAnswers.length)) * 100 : 0
            }
            sx={{ mt: 1, height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* Falsche Antworten */}
        {wrongAnswers.length > 0 && (
          <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h6">❌ Falsche Antworten (klicken, um erneut zu üben)</Typography>
            {wrongAnswers.map((item, index) => (
              <Button
                key={index}
                onClick={() => handleRepeat(index)}
                variant={item.corrected ? "outlined" : "contained"}
                color={item.corrected ? "secondary" : "error"}
                startIcon={<CancelIcon />}
                sx={{ m: 0.5, minWidth: "150px", justifyContent: "flex-start", textTransform: "none" }}
              >
                {item.a} {item.op} {item.b} | Dein Ergebnis: {item.userAnswer}
              </Button>
            ))}
          </Paper>
        )}
      </Paper>

      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(150px) scale(0.5); opacity: 0; }
          }
          @media (max-width: 768px) {
            input {
              width: 120px !important;
              font-size: 1rem !important;
            }
          }
        `}
      </style>
    </Container>
  );
}

export default App;
