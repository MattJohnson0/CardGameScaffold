export default class Card {
  constructor(scene, index) {
    this.render = (x, y, sprite) => {
      let card = scene.add
        .image(x, y, sprite)
        .setScale(0.3, 0.3)
        .setDepth(index)
        .setInteractive();
      scene.input.setDraggable(card);
      return card;
    };
  }
}
