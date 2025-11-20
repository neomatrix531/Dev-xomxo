<%@ page import="java.util.*" %>
<%
    // Initialize game state in session
    Integer secretNumber = (Integer) session.getAttribute("secretNumber");
    Integer attempts = (Integer) session.getAttribute("attempts");

    if (secretNumber == null) {
        secretNumber = new Random().nextInt(100) + 1; // number between 1–100
        session.setAttribute("secretNumber", secretNumber);
        attempts = 0;
        session.setAttribute("attempts", attempts);
    }

    String message = "";
    String guessParam = request.getParameter("guess");

    if (guessParam != null) {
        try {
            int guess = Integer.parseInt(guessParam);
            attempts++;
            session.setAttribute("attempts", attempts);

            if (guess == secretNumber) {
                message = "🎉 Correct! The number was " + secretNumber +
                          ". You guessed it in " + attempts + " tries.";
            } else if (guess < secretNumber) {
                message = "Too low! Try again.";
            } else {
                message = "Too high! Try again.";
            }
        } catch (NumberFormatException e) {
            message = "Please enter a valid number.";
        }
    }

    // Reset game if requested
    if ("true".equals(request.getParameter("reset"))) {
        session.removeAttribute("secretNumber");
        session.removeAttribute("attempts");
        message = "Game reset! Guess the new number.";
    }
%>
<html>
<head>
    <title>Number Guessing Game</title>
    <style>
        body { font-family: Arial; text-align: center; margin-top: 50px; }
        input { padding: 5px; }
        button { padding: 5px 10px; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Guess the Number (1–100)</h1>
    <form method="post">
        <input type="text" name="guess" placeholder="Enter your guess" />
        <button type="submit">Submit</button>
    </form>
    <p><%= message %></p>

    <form method="post">
        <button type="submit" name="reset" value="true">Reset Game</button>
    </form>
</body>
</html>