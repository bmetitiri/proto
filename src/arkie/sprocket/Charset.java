package arkie.sprocket;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Point;
import android.graphics.Rect;

public class Charset implements Sprocket {
	Bitmap bitmap; Controller main; Direction direction;
	boolean animate; int frame, width, height, columns, rows, x, y;
	int[] frame_order = new int[]{1,2,1,0};
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	public Charset(Controller main, Bitmap bitmap){
		this.main = main; this.bitmap = bitmap;
		direction = Direction.DOWN;
	}
	public void draw(Canvas canvas){
		Rect camera = main.getCamera();
		int fromX = this.frame_order[frame%4]*this.width;
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
	public int getHeight(){return height;}
	public int getWidth(){return width;}
	public Point getPosition(){return new Point(x, y);}
	public void setPosition(Point p){x = p.x; y = p.y;}
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
}
