package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect

import arkie.sprockets.Sprite;

public class CharSprite implements Sprite {
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	Bitmap bitmap;
	int height, width, frame;
	Direction direction;
	public CharSprite(Bitmap bitmap){
		this.setBitmap(bitmap);
		this.setDirection(Direction.DOWN);
		this.frame = 1;
	}
	public CharSprite(Context context, int bitmap){
		this(BitmapFactory.decodeResource(context.getResources(), bitmap));}
	public void draw(Canvas canvas, Rect rect){
		int x = this.frame*this.width;
		int y = offset(this.direction)*this.height;
		canvas.drawBitmap(this.bitmap, new Rect(
					x, y, x+this.width, y+this.height), rect, null);
	}
	public void setBitmap(Bitmap bitmap){
		this.bitmap = bitmap;
		this.height = bitmap.getHeight()/4;
		this.width = bitmap.getWidth()/3;
	}
	public int getHeight(){return this.height;}
	public int getWidth(){return this.width;}
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
