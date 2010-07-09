package arkie.sprocket;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Point;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;

public class Charset implements Sprocket {
	Bitmap bitmap; Controller main; Direction direction;
	boolean animate; int frame, width, height, columns, rows, x, y;
	int[] frame_order = new int[]{1,1,2,2,1,1,0,0};
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	public Charset(Controller main, Bitmap bitmap){
		this.main = main; this.bitmap = bitmap;
		direction = Direction.DOWN;
	}
	public void draw(Canvas canvas){
		Rect camera = main.getCamera();
		int fromX = this.frame_order[frame%8]*this.width;
		int fromY = offset(this.direction)*this.height;
		int toX = x - camera.left;
		int toY = y - camera.top;
		if (toX+width > camera.left && toX < camera.right &&
				toY+height > camera.top && toY < camera.bottom){
			canvas.drawBitmap(this.bitmap,
					new Rect(fromX, fromY, fromX+this.width, fromY+this.height),
					new Rect(toX, toY, toX+this.width, toY+this.height), null);
		}
	}
	public Rect getRect(){
		return new Rect(x, y, x+width, y+height);
	}
	public void setPosition(int x, int y){this.x = x; this.y = y;}
	public void setTileSize(int width, int height){
		this.width = width; this.height = height;
		columns = bitmap.getWidth()/width;
		rows = bitmap.getHeight()/height;
	}
	public boolean update(){
		if (animate){frame++; return true;}
		else {frame = 0; return false;}
	}
	int offset(Direction direction){
		switch(direction){
			case LEFT: return 3;
			case DOWN: return 2;
			case UP: return 0;
			case RIGHT: return 1;
			default: return 2;
		}
	}
	public boolean onTouch(View view, MotionEvent event){return false;}
}
