import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Paper, Box, Button, LinearProgress } from "@mui/material";
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

  const answerRef = useRef(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Fokus auf Eingabe
  useEffect(() => {
    answerRef.current.focus();
  }, [question]);

  // Generiere neue Frage, keine negativen Ergebnisse
  function generateQuestion() {
    const op = Math.random() < 0.5 ? "+" : "-";
    let a, b;
    if (op === "+") {
      a = Math.floor(Math.random() * 101);
      b = Math.floor(Math.random() * 101);
    } else {
      a = Math.floor(Math.random() * 101);
      b = Math.floor(Math.random() * (a + 1)); // b <= a
    }
    return { a, b, op };
  }

  function handleSubmit() {
    if (answer === "") return;
    const userAnswer = parseInt(answer);
    const correctAnswer = question.op === "+" ? question.a + question.b : question.a - question.b;

    if (userAnswer === correctAnswer) {
      setCorrectCount(correctCount + 1);
      setShowConfetti(true);
      setFlashColor(true);
      spawnStars();
      setTimeout(() => {
        setShowConfetti(false);
        setFlashColor(false);
      }, 2000);
    } else {
      setWrongAnswers([...wrongAnswers, { ...question, userAnswer, repeat: false }]);
    }

    setQuestion(generateQuestion());
    setAnswer("");
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") handleSubmit();
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

  function handleRepeat(index) {
    const item = wrongAnswers[index];
    setQuestion({ a: item.a, b: item.b, op: item.op });
    const newList = [...wrongAnswers];
    newList[index].repeat = true;
    setWrongAnswers(newList);
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

        <Typography variant="h4" gutterBottom align="center">
          Mathematik-Trainer 🎯
        </Typography>

        {/* Frage */}
        <Box display="flex" justifyContent="center" my={3}>
          <Paper sx={{ p: 3, minWidth: 200, textAlign: "center", boxShadow: 4 }}>
            <Typography variant="h5">
              {question.a} {question.op} {question.b} = ?
            </Typography>
          </Paper>
        </Box>

        {/* Eingabe */}
        <Box display="flex" justifyContent="center" gap={2} mb={3} flexWrap="wrap">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyPress}
            ref={answerRef}
            style={{
              padding: "10px 15px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "2px solid #1976d2",
              width: "150px",
              textAlign: "center",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<CheckCircleIcon />}
            sx={{
              fontSize: "1.1rem",
              padding: "10px 20px",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Prüfen
          </Button>
        </Box>

        {/* Fortschritt */}
        <Box>
          <Typography variant="h6">Fortschritt</Typography>
          <Typography>
            ✅ Richtig: {correctCount} | ❌ Falsch: {wrongAnswers.length} | Gesamt: {correctCount + wrongAnswers.length}
          </Typography>
          <Typography>⏱ Zeit: {elapsedTime}s</Typography>
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
                variant={item.repeat ? "outlined" : "contained"}
                color={item.repeat ? "secondary" : "error"}
                startIcon={<CancelIcon />}
                sx={{ m: 0.5, minWidth: "150px", justifyContent: "flex-start", textTransform: "none" }}
              >
                {item.a} {item.op} {item.b} = {item.op === "+" ? item.a + item.b : item.a - item.b} | Dein Ergebnis:{" "}
                {item.userAnswer}
              </Button>
            ))}
          </Paper>
        )}
      </Paper>

      {/* Sterne Animation */}
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
