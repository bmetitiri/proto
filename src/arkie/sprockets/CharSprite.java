package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect

import arkie.sprockets.Sprite;

public class CharSprite implements Sprite {
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	Bitmap bitmap;
	int height, width, rows, columns, row;
	Direction direction;
	public CharSprite(Bitmap bitmap, int rows, int columns){
		this.setBitmap(bitmap, rows, columns);
		this.setDirection(Direction.DOWN);
	}
	public CharSprite(Context context, int bitmap, int rows, int columns){
		this(BitmapFactory.decodeResource(context.getResources(),
					bitmap), rows, columns);
	}
	public void draw(Canvas canvas, Rect rect){
		int y = offset(this.direction)*this.height;
		canvas.drawBitmap(this.bitmap, new Rect(
					0, y, this.width, y+this.height), rect, null);
	}
	public void setBitmap(Bitmap bitmap, int rows, int columns){
		this.bitmap = bitmap;
		this.height = bitmap.getHeight()/rows;
		this.width = bitmap.getWidth()/columns;
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
