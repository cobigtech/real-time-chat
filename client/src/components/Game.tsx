import { useAuth } from "@/providers/AuthProvider"
import { Button } from "./ui/button"
import axios from "axios"
import { useEffect } from "react"
import { Game as GameType } from "@/types"
import { useChat } from "@/providers/ChatProvider"

interface GameProps {
  game: GameType
}

const Game = ({ game }: GameProps) => {
  return (
    <div className="w-full md:w-[24rem] ml-auto p-4 border border-neutral-800 rounded-2xl space-y-4">
      {game.status === "waiting" && <GameWait game={game} />}
      {game.status === "over" && <GameOver game={game} />}
      {game.status === "running" && <GameRunning game={game} />}
    </div>
  )
}

export default Game

const GameWait = ({ game }: GameProps) => {
  const { authUser } = useAuth()

  const otherPlayerName = game.players.find((player) => player._id !== authUser?._id)?.name

  function handlePlay() {
    axios.post(`/game/${game._id}/start`)
  }

  return (
    <div className="py-8 text-xl text-center grid place-content-center gap-4">
      {game.from === authUser?._id ? (
        <>
          <p>Waiting for {otherPlayerName} to accept invitation...</p>
        </>
      ) : (
        <>
          <p>{otherPlayerName} wants to play TicTacToe with you</p>
          <Button onClick={handlePlay} size="sm">
            Play
          </Button>
        </>
      )}
    </div>
  )
}

const GameRunning = ({ game }: GameProps) => {
  const { authUser } = useAuth()
  const { updateGameMessage } = useChat()

  const myTurn = game.players[game.turn]._id === authUser?._id

  // set game message
  useEffect(() => {
    let message
    if (game.win) {
      message = game.win.playerId === authUser?._id ? "You won" : "You lost"
    } else if (game.draw) {
      message = "It's a draw"
    } else {
      message = myTurn ? "It's your turn" : "Waiting for your turn"
    }

    if (game.message !== message) {
      updateGameMessage(game.chat, game._id, message)
    }
  }, [game, authUser, myTurn, updateGameMessage])

  return (
    <>
      <GameMessage message={game.message} />
      <GameBoard game={game} myTurn={myTurn} />
      <GameScore scores={game.scores} players={game.players} />
    </>
  )
}

interface GameMessageProps {
  message?: string
}

const GameMessage = ({ message }: GameMessageProps) => {
  if (!message) return null

  return <div className="text-sm px-3 py-1.5 w-fit m-auto rounded-full border border-neutral-800">{message}</div>
}

interface GameBoardProps {
  game: GameType
  myTurn: boolean
}

const GameBoard = ({ game, myTurn }: GameBoardProps) => {
  function handlePlay(index: number) {
    axios.post(`/game/${game._id}/play`, { index })
  }

  return (
    <div className="grid grid-cols-3 w-full overflow-hidden">
      {game.board.map((square, id) => (
        <button
          key={id}
          onClick={() => handlePlay(id)}
          className="grid place-content-center w-full aspect-square border border-neutral-800 disabled:cursor-not-allowed"
          disabled={!myTurn || square !== null}
        >
          {getMark(square)}
        </button>
      ))}
    </div>
  )
}

function getMark(value: number | null) {
  switch (value) {
    case 0:
      return (
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="59.5" cy="59.5" r="23.5" stroke="white" stroke-width="12" />
        </svg>
      )

    case 1:
      return (
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="83" y="27" width="12" height="70" rx="6" transform="rotate(45 83 27)" fill="white" />
          <rect x="92" y="76" width="12" height="70" rx="6" transform="rotate(135 92 76)" fill="white" />
        </svg>
      )

    default:
      return ""
  }
}

interface GameScoreProps {
  scores: GameType["scores"]
  players: GameType["players"]
}

const GameScore = ({ scores, players }: GameScoreProps) => {
  const { authUser } = useAuth()
  const otherPlayer = players.find((player) => player._id !== authUser?._id)

  if (!authUser || !otherPlayer) return null

  return (
    <table className="text-center w-full">
      <thead>
        <tr>
          <th>{otherPlayer?.name}</th>
          <th>Draws</th>
          <th>You</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{scores[otherPlayer?._id]}</td>
          <td>{scores.draws}</td>
          <td>{scores[authUser._id]}</td>
        </tr>
      </tbody>
    </table>
  )
}

interface GameOverProps {
  game: GameType
}

const GameOver = ({ game }: GameOverProps) => {
  return (
    <div className="space-y-4">
      <p className="text-center">You played a game of TicTacToe</p>
      <GameScore scores={game.scores} players={game.players} />
    </div>
  )
}
