export class Navigation {
  constructor(root, actions) {
    this.root = root;
    this.actions = actions;
    this.handleClick = this.handleClick.bind(this);
    root.addEventListener("click", this.handleClick);
  }

  handleClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger || trigger.disabled) return;
    const action = trigger.dataset.action;
    this.actions[action]?.(trigger);
  }

  dispose() {
    this.root.removeEventListener("click", this.handleClick);
  }
}
