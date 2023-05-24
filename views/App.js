import AbstractView from "./AbstractView.js";
export default class extends AbstractView{
  constructor(router){
    super();
    this.router = router;
  }
  get_html_path(){
    return './views/app.html'
  }
  async set_page(){
    document.title = "Music Player"
    this._insertPlayerView();
    this._insertGalleryView();
    this._addFlipCardEventListener();

  }
  _insertPlayerView() {
    this.router.insert_view("card-back", "player");
  }

  _insertGalleryView() {
    this.router.insert_view("card-front", "gallery");
  }

  _addFlipCardEventListener() {
    const flip_btn = document.querySelector(".flipButton");
    const flipCard = document.querySelector(".flip-card");
    flip_btn.addEventListener("dragstart", (event) => {
      event.target.classList.add("dragging");
    });
    flip_btn.addEventListener("dragend", (event) => {
      event.target.classList.remove("dragging");
      flipCard.classList.toggle("flip-card-active");
    });
    flip_btn.addEventListener("click", () => {
      flipCard.classList.toggle("flip-card-active");
    });
  }

}