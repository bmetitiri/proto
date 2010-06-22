package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, Point

public class ChipSprite extends Sprite {
	int columns, rows;
	Point fallback;
	public ChipSprite(){}
	public ChipSprite(Bitmap bitmap, int width, int height){
		super(bitmap);
		this.setSize(width, height);
	}
	public ChipSprite(Context context, int bitmap, int width, int height){
		super(context, bitmap);
		this.setSize(width, height);
	}
	public void setSize(int width, int height){
		this.width = width; this.height = height;
		this.columns = this.getWidth()/width;
		this.rows = this.getHeight()/height;
	}
	public void setDefault(int x, int y){
		this.fallback = new Point(x, y);
	}
	public void setDefault(Point fallback){
		this.fallback = fallback;
	}
	public void draw(Canvas canvas, float xout, float yout){
		int x = this.fallback.x*this.width;
		int y = this.fallback.y*this.height;
		canvas.drawBitmap(this.bitmap, new Rect(
					x, y, x+this.width, y+this.height), new RectF(
					xout, yout, xout+this.width, yout+this.height), null);
	}
}
