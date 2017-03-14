package gintendo

import (
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"time"
)

const (
	DetailUrl = `http://www.nintendo.com/games/detail/%s`
	ListUrl   = `http://www.nintendo.com/json/content/get/game/list/filter/subset?qsortBy=releaseDate&qdirection=descend&%s`
)

type Image struct {
	Url string
}

type Game struct {
	ID      string
	Title   string `json:"short_title"`
	Release string `json:"release_date"`
	Box     Image  `json:"front_box_art"`
	System  string
	Price   float64
	Updated time.Time
}

type Result struct {
	Total int
	Games []Game `json:"game"`
}

type Client struct {
	Hardware []Hardware
	HTTP     *http.Client
}

type Hardware string

const (
	Switch  Hardware = "Nintendo Switch"
	IOS              = "iOS"
	Mobile           = "iOS/Android"
	Wii              = "Wii"
	WiiU             = "Wii U"
	ThreeDS          = "3DS"
	DS               = "DS"
)

// Go doesn't support const arrays.
var All = []Hardware{Switch, IOS, Mobile, Wii, WiiU, ThreeDS, DS}

var (
	defaults   = &Client{HTTP: &http.Client{}, Hardware: All}
	priceRegex = regexp.MustCompile(`[0-9]+(\.[0-9]+)?`)
)

func (n *Client) Load(id string) (*Game, error) {
	res, err := n.HTTP.Get(fmt.Sprintf(DetailUrl, id))
	if err != nil {
		return nil, err
	}
	if res.StatusCode != 200 {
		return nil, fmt.Errorf("Got status %v", res.StatusCode)
	}
	doc, err := goquery.NewDocumentFromResponse(res)
	if err != nil {
		return nil, err
	}
	image, _ := doc.Find("#main-box-art").Attr("src")
	price, _ := strconv.ParseFloat(priceRegex.FindString(
		doc.Find(".price_display").First().Text()), 64)
	game := Game{
		ID:      id,
		Title:   doc.Find("h1").First().Text(),
		Release: doc.Find("#release_date").First().Text(),
		Box:     Image{Url: image},
		System:  doc.Find(".system").First().Text(),
		Price:   price,
		Updated: time.Now(),
	}
	return &game, nil
}

func (n *Client) Search(q string) (*Result, error) {
	v := url.Values{}
	v.Set("qtitlelike", q)
	for _, k := range n.Hardware {
		v.Add("qhardware", string(k))
	}
	res, err := n.HTTP.Get(fmt.Sprintf(ListUrl, v.Encode()))
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	decoder := json.NewDecoder(res.Body)
	result := &Result{}
	err = decoder.Decode(result)
	return result, nil
}

func Load(id string) (*Game, error) {
	return defaults.Load(id)
}

func Search(q string) (*Result, error) {
	return defaults.Search(q)
}
