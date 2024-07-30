import BaseComponent from "./BaseComponent";

interface CanvasOptions {
	fillStyle?: string;
	strokeStyle?: string;
	lineWidth?: number;
}
class WebComponent extends BaseComponent {
	disabled: boolean = false;
	options: Required<CanvasOptions> = {
		fillStyle: '#f2f2f2',
		strokeStyle: '#000',
		lineWidth: 1
	};

	private canvas: HTMLCanvasElement;
	private isDrawing: boolean = false;
	private moveCount: number = 0;
	private boundTouchStart: any;
	private boundTouchMove: any;
	private boundTouchEnd: any;

	static get observedAttributes(): string[] {
		return ["disabled"];
	}
	constructor() {
		super();

		let canvas = document.createElement("canvas");
		canvas.classList.add("dyn-component--web-components", "dyn-signature-canvas");
		this.shadowRoot!.appendChild(canvas);
		this.canvas = canvas;

		this.boundTouchStart = this.touchStart.bind(this);
		this.boundTouchMove = this.touchMove.bind(this);
		this.boundTouchEnd = this.touchend.bind(this);
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		switch (name) {
			case "disabled": {
				this.disabled = BaseComponent.getBooleanValue(newValue);
				break
			}
		}
	}

	connectedCallback() {
		this.canvas.width = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.clear();

		this.canvas.addEventListener('touchstart', this.boundTouchStart);
		this.canvas.addEventListener('touchmove', this.boundTouchMove);
		this.canvas.addEventListener('touchend', this.boundTouchEnd);

		this.canvas.addEventListener('mousedown', this.boundTouchStart);
		this.canvas.addEventListener('mousemove', this.boundTouchMove);
		this.canvas.addEventListener('mouseup', this.boundTouchEnd);
	}

	disconnectedCallback() {
		this.canvas.removeEventListener('touchstart', this.boundTouchStart);
		this.canvas.removeEventListener('touchmove', this.boundTouchMove);
		this.canvas.removeEventListener('touchend', this.boundTouchEnd);

		this.canvas.removeEventListener('mousedown', this.boundTouchStart);
		this.canvas.removeEventListener('mousemove', this.boundTouchMove);
		this.canvas.removeEventListener('mouseup', this.boundTouchEnd);
	}

	setOptions(options: CanvasOptions) {
		this.options = Object.assign(this.options, options);
	}

	private touchStart(e: any) {
		e.preventDefault();
		if (this.disabled) return;

		this.isDrawing = true;
		const ctx = this.canvas.getContext('2d');
		if (ctx) {
			let rect = e.target.getBoundingClientRect()
			ctx.beginPath()
			Object.assign(ctx, this.options);
			let rectX = rect.x || rect.left
			let rectY = rect.y || rect.top
			let x = e.type.startsWith('touch') ? (e.changedTouches[0].pageX - rectX) : e.offsetX
			let y = e.type.startsWith('touch') ? (e.changedTouches[0].pageY - rectY) : e.offsetY
			ctx.moveTo(x, y)
		}
	}
	private touchMove(e: any) {
		console.log(e.type)
		e.preventDefault();
		if (this.disabled) return;
		if (!this.isDrawing) return;

		const ctx = this.canvas.getContext('2d');
		if (ctx && e.offsetX || e.changedTouches) {
			let rect = e.target.getBoundingClientRect()
			let rectX = rect.x || rect.left
			let rectY = rect.y || rect.top
			let x = e.type.startsWith('touch') ? (e.changedTouches[0].pageX - rectX) : e.offsetX
			let y = e.type.startsWith('touch') ? (e.changedTouches[0].pageY - rectY) : e.offsetY
			ctx!.lineTo(x, y)
			ctx!.stroke()
			this.moveCount++
		}
	}

	private touchend(e: any) {
		e.preventDefault();
		if (this.disabled) return;
		if (!this.isDrawing) return;

		this.isDrawing = false;
		const ctx = this.canvas.getContext('2d');
		if (ctx) {
			ctx.closePath()

			// 触发自定义事件
			const event = new CustomEvent('move-count-change', {
				detail: { message: 'move count!', value: this.moveCount },
				bubbles: true,
				composed: true
			});
			this.dispatchEvent(event);
		}
	}
	clear() {
		let ctx = this.canvas.getContext('2d')
		if (ctx) {
			ctx!.fillStyle = this.options.fillStyle
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
			this.moveCount = 0
			this.isDrawing = false;
		}
	}
	toDataURL(type = 'image/png', quality: any = 0.5) {
		return this.canvas.toDataURL(type, quality)
	}
	toBlob(type = 'image/png', quality: any = 0.5) {
		return new Promise((resolve) => {
			this.canvas.toBlob((blob) => {
				resolve(blob)
			}, type, quality)
		})
	}
}

const define = (name: string, options?: ElementDefinitionOptions) => {
	customElements.define(name, WebComponent, options);
};

export { define };
export default WebComponent;
