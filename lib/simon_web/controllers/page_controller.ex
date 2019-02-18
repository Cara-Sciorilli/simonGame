defmodule SimonWeb.PageController do
  use SimonWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def game(conn, %{"game" => game}) do
    name = get_session(conn, :name)
    if name do
      render conn, "game.html", game: game, name: name
    else
      conn
      |> put_flash(:error, "Must enter player name")
      |> redirect(to: "/")
    end
  end

  def game_form(conn, %{"name" => name, "game" => game}) do
    conn
    |> put_session(:name, name)
    |> redirect(to: "/game/" <> game)
  end
end
