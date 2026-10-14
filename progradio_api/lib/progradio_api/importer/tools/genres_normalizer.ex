defmodule ProgRadioApi.Importer.Classifiers.GenresNormalizer do
  @moduledoc """
  Normalizes the genres of a stream: the variants of a same genre ("musica regional",
  "regional mexicana", "música regional mexicana"...) are replaced by one canonical
  name, so that they can be grouped.
  Meant to be piped after TagsClassifier.classify/1.
  """

  # canonical name => its variants
  @canonical_genres %{
    # latin america
    "regional mexican" => [
      "regional mexicana",
      "regional mexicano",
      "regional-mexican",
      "música regional",
      "musica regional",
      "música regional mexicana",
      "musica regional mexicana"
    ],
    "grupera" => ["grupero"],
    "norteño" => ["norteña", "norteno"],
    "ranchera" => ["rancheras"],
    "corridos" => ["corrido"],
    "latin" => ["latin music", "musica latina", "música latina", "latino", "latinos"],
    "latin pop" => ["latín pop"],
    "balada" => [
      "baladas",
      "balada en español",
      "baladas en español",
      "baladas en espaol"
    ],
    "balada en inglés" => ["baladas en inglés", "baladas en ingles"],
    "balada pop" => ["baladas pop"],
    "bolero" => ["boleros"],
    "cumbia" => ["cumbias"],
    "vallenato" => ["vallenatos"],
    "salsa" => ["salsas"],
    "merengue" => ["merengues"],
    "bachata" => ["bachatas"],
    "tango" => ["tangos"],
    "reggaeton" => ["reggaetón"],
    "tropical" => ["tropical music", "música tropical", "musica tropical"],
    "música andina" => ["musica andina"],
    "pop en inglés" => ["pop en ingles"],
    "rock en español" => ["rock en espanol"],
    "rock en inglés" => ["rock en ingles"],
    "bossa nova" => ["bossa-nova", "bossanova"],

    # africa, caribbean, arabic world
    "arabic" => ["arabic music", "arab"],
    "arabic classical" => ["classical arabic", "classic arabic"],
    "raï" => ["rai"],
    "african" => ["african music"],
    "afropop" => ["afro pop", "afro-pop"],
    "afrobeat" => ["afro beat"],
    "afrobeats" => ["afro beats"],
    "afro house" => ["afro-house", "afrohouse"],
    "afro jazz" => ["afro-jazz"],
    "kompa" => ["compas", "konpa", "kompas"],
    "dancehall" => ["dance hall"],

    # pop
    "pop" => ["pop music", "pop-music", "música pop", "musica pop"],
    "pop rock" => ["pop-rock", "poprock", "pop/rock", "pop. rock"],
    "pop dance" => ["pop-dance"],
    "pop folk" => ["pop-folk", "pop - folk"],
    "dance pop" => ["dance-pop", "dancepop"],
    "soft pop" => ["soft-pop"],
    "indie pop" => ["indie-pop", "indiepop"],
    "synthpop" => ["synth-pop", "synth pop"],
    "electropop" => ["electro-pop", "electro pop"],
    "j-pop" => ["jpop", "j pop"],
    "k-pop" => ["kpop", "k pop"],
    "mandopop" => ["mando-pop", "mando pop"],
    "ballads" => ["ballad"],
    "top 40" => ["top40"],

    # rock and metal
    "rock" => ["rock music"],
    "classic rock" => ["classic-rock", "classicrock"],
    "soft rock" => ["soft-rock", "softrock"],
    "hard rock" => ["hard-rock", "hardrock"],
    "heavy rock" => ["heavy-rock"],
    "indie" => ["indies"],
    "indie rock" => ["indie-rock"],
    "progressive rock" => ["progressive-rock"],
    "modern rock" => ["modernrock"],
    "adult rock" => ["ροκ - adult rock"],
    "blues rock" => ["bluesrock"],
    "garage rock" => ["garage-rock"],
    "stoner rock" => ["stonerrock"],
    "yacht rock" => ["yacht-rock"],
    "80s rock" => ["80's rock"],
    "post-rock" => ["post rock", "postrock"],
    "post-punk" => ["post punk", "postpunk"],
    "j-rock" => ["jrock", "j rock"],
    "neo-prog" => ["neo prog"],
    "rock'n'roll" => [
      "rock n roll",
      "rock 'n' roll",
      "rock 'n roll",
      "rock n' roll",
      "rock'n roll",
      "rockn roll",
      "rock-n-roll",
      "rock & roll",
      "rock&roll"
    ],
    "heavy metal" => ["heavy-metal"],
    "nu metal" => ["nu-metal", "numetal"],
    "death metal" => ["death-metal", "deathmetal"],
    "death doom metal" => ["death-doom metal"],
    "progressive metal" => ["progressive-metal"],

    # electronic
    "electronic" => ["electronic music"],
    "electronica" => ["electrónica"],
    "edm" => ["electronic dance music"],
    "dance" => ["dance music"],
    "eurodance" => ["euro dance"],
    "euro disco" => ["eurodisco"],
    "italo disco" => ["italo-disco", "italodisco"],
    "chillout" => ["chill-out", "chill out"],
    "chill house" => ["chill-house", "chillhouse"],
    "deep house" => ["deephouse"],
    "electro house" => ["electrohouse"],
    "hard techno" => ["hardtechno"],
    "psytrance" => ["psy trance", "psy-trance"],
    "breakbeat" => ["break beat", "breakbeats"],
    "drum and bass" => ["drum & bass", "drum'n'bass", "dnb"],
    "trip hop" => ["trip-hop", "triphop"],
    "lo-fi" => ["lofi"],
    "lounge" => ["lounge music"],
    "new age" => ["new-age", "newage"],

    # hip hop, r&b, jazz
    "hip hop" => ["hip-hop", "hiphop"],
    "hip hop r&b" => ["hiphop r&b"],
    "r&b" => ["rnb", "rb", "r'n'b", "r&b/urban"],
    "nu-soul" => ["nu soul"],
    "smooth jazz" => ["smooth-jazz", "smoothjazz"],
    "vocal jazz" => ["vocal-jazz"],
    "nu-jazz" => ["nu jazz", "nujazz"],
    "big band" => ["big bands"],

    # others
    "folk" => ["folk music", "folks"],
    "country" => ["country music"],
    "honky tonk" => ["honky-tonk"],
    "western" => ["westerns"],
    "singer-songwriter" => ["singer songwriter"],
    "classical" => ["classical music"],
    "christian" => ["christian music"],
    "traditional" => ["traditional music"],
    "world" => ["world music", "world-music", "worldmusic", "world musics"],
    "easy listening" => ["easy-listening", "easylistening"],
    "soundtrack" => ["soundtracks"],
    "schlager" => ["schlagers"],
    "chanson" => ["chansons"],
    "chanson française" => [
      "chanson francaise",
      "chansons françaises",
      "french chanson",
      "french chansons"
    ],
    "shanson" => ["шансон"]
  }

  @aliases for {canonical, variants} <- @canonical_genres,
               variant <- variants,
               into: %{},
               do: {variant, canonical}

  @doc """
  Takes and returns `{genres, others}`, as returned by TagsClassifier.classify/1.
  Only the genres are normalized.
  """
  def normalize({genres, others}), do: {normalize_genres(genres), others}

  @doc """
  Normalizes a comma separated string of genres, returns nil when empty.
  """
  def normalize_genres(genres) when is_binary(genres) do
    genres
    |> String.split(",")
    |> Enum.map(&clean/1)
    |> Enum.reject(&(&1 == ""))
    |> Enum.map(&Map.get(@aliases, &1, &1))
    |> Enum.uniq()
    |> case do
      [] -> nil
      genres -> Enum.join(genres, ",")
    end
  end

  def normalize_genres(_genres), do: nil

  @doc """
  Cleans a genre name: lowercased, one kind of apostrophe ("80’s" is "80's"), no
  punctuation around it (`"pop`, `folk"`, `rock...`) and single spaces.
  Returns "" when there is nothing but punctuation.
  """
  def clean(genre) do
    genre
    |> String.downcase()
    |> String.replace(~r/[’‘´`]/u, "'")
    |> String.replace(~r/^[^[:alnum:]]+|[^[:alnum:]]+$/u, "")
    |> String.replace(~r/\s+/u, " ")
  end
end
