defmodule Simon.Game do
  def new(player1) do
    %{
      players: [player1],
      currentPlayerInd: 0,
      pattern: [],
      clickedColor: "",
      expectedColorInd: 0,
      losers: [],
      winner: "",
      count: 0,
      addClick: true,
    }
  end

  def add_player(game, newPlayer) do
    game
    |> Map.put(:players, game.players ++ [newPlayer])
  end

  def client_view(game) do
    cc = game.clickedColor
    cp = Enum.at(game.players, game.currentPlayerInd)
    l = game.losers
    w = game.winner
    c = game.count
    a = game.addClick
    %{
      color: cc,
      currentPlayer: cp,
      losers: l,
      winner: w,
      count: c,
      addClick: a,
    }
  end

  def turn_off(game) do
    game
    |> Map.put(:clickedColor, "")
  end

  def guess(game, player, color) do
    if (player == Enum.at(game.players, game.currentPlayerInd) && length(game.players) != 1) do
      cond do
        game.expectedColorInd == length(game.pattern) ->
          newIndex =
            if game.currentPlayerInd == (length(game.players) - 1)  do
              0
            else
              game.currentPlayerInd + 1
            end
          game
          |> Map.put(:pattern, game.pattern ++ [color])
          |> Map.put(:currentPlayerInd, newIndex)
          |> Map.put(:expectedColorInd, 0)
          |> Map.put(:clickedColor, color)
          |> Map.put(:count, game.count+1)
          |> Map.put(:addClick, false)
        Enum.at(game.pattern, game.expectedColorInd) == color ->
          if(game.expectedColorInd + 1 == length(game.pattern)) do
            game
            |> Map.put(:expectedColorInd, game.expectedColorInd + 1)
            |> Map.put(:clickedColor, color)
            |> Map.put(:addClick, true)
          else
            game
            |> Map.put(:expectedColorInd, game.expectedColorInd + 1)
            |> Map.put(:clickedColor, color)
            |> Map.put(:addClick, false)
          end
        true ->
          lessPlayers = List.delete(game.players, player)
          if length(lessPlayers) == 1 do
            game
            |> Map.put(:winner, hd(lessPlayers))
            |> Map.put(:losers, game.losers++[player])
            |> Map.put(:players, lessPlayers)
            |> Map.put(:clickedColor, color)
          else
            game
            |> Map.put(:expectedColorInd, 0)
            |> Map.put(:losers, game.losers++[player])
            |> Map.put(:players, lessPlayers)
            |> Map.put(:clickedColor, color)
          end
      end
    else
        game
    end
  end
end
