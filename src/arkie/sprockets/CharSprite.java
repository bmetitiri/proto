package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect, RectF

import arkie.sprockets.*;

public class CharSprite extends Sprite {
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	int frame = 1, type = 1;
	Direction direction = Direction.DOWN;
	public CharSprite(Context context, int bitmap){
		super(context, bitmap);
	}
	public void draw(Canvas canvas, float xout, float yout){
		int x = this.frame*this.width;
		int y = offset(this.direction)*this.height;
		canvas.drawBitmap(this.bitmap, new Rect(
					x, y, x+this.width, y+this.height), new RectF(
					xout, yout, xout+this.width, yout+this.height), null);
	}
	public void setBitmap(Bitmap bitmap){
		this.bitmap = bitmap;
		this.height = bitmap.getHeight()/4;
		this.width = bitmap.getWidth()/3;
	}
	public Direction getDirection(){return this.direction;}
	public void setDirection(Direction direction){
		this.direction = direction;}
	int offset(Direction direction){
		switch(direction){
			case UP: return 0;
			case RIGHT: return 1;
			case DOWN: return 2;
			case LEFT: return 3;
		}
		return 0;
	}
}
