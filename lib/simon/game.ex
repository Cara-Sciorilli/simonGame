defmodule Simon.Game do
  def new(player1) do
    %{
      players: [player1],
      currentPlayerInd: 0,
      pattern: [],
      clickedColor: "",
      expectedColorInd: 0,
      loser: "",
    }
  end

  def add_player(game, player2) do
    game
    |> Map.put(:players, game.players ++ [player2])
  end

  def client_view(game) do
    cc = game.clickedColor
    cp = Enum.at(game.players, game.currentPlayerInd)
    l = game.loser
    %{
      color: cc,
      currentPlayer: cp,
      loser: l,
    }
  end

  def turn_off(game) do
    game
    |> Map.put(:clickedColor, "")
  end

  def guess(game, player, color) do
    if (player == Enum.at(game.players, game.currentPlayerInd)) do
      cond do
        game.expectedColorInd == length(game.pattern) ->
          newIndex =
            if game.currentPlayerInd == 0 do
              1
            else
              0
            end
          game
          |> Map.put(:pattern, game.pattern ++ [color])
          |> Map.put(:currentPlayerInd, newIndex)
          |> Map.put(:expectedColorInd, 0)
          |> Map.put(:clickedColor, color)
        Enum.at(game.pattern, game.expectedColorInd) == color ->
          game
          |> Map.put(:expectedColorInd, game.expectedColorInd + 1)
          |> Map.put(:clickedColor, color)
        true ->
          game
          |> Map.put(:loser, player)
          |> Map.put(:clickedColor, color)
      end
    else
      game
    end
  end
end
