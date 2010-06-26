package arkie.sprocket;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect

import arkie.sprocket.Sprocket;

public class Charset implements Sprocket {
	public enum Direction {UP, RIGHT, DOWN, LEFT}
	Bitmap tileset;
	int frame, offsetX, offsetY, columns, rows, spriteWidth, spriteHeight;
	Direction direction;
	public Charset(Context context, int tileset){
		this.tileset = BitmapFactory.decodeResource(
				context.getResources(), tileset);
		setGrid(30, 16, 0, 0); // TODO: This is the default for RPGMaker ...
	}
	public void draw(Canvas canvas){
	}
	public int getHeight(){return spriteHeight * rows;}
	public int getWidth(){return spriteWidth * columns;}
	public void setFallback(int x, int y){setFallback((short)(x*columns+y));}
	public void setFallback(Short fallback){this.fallback = fallback;}
	// Call setSpriteSize OR setGrid
	public void setSpriteSize(int width, int height){
		spriteWidth = width; spriteHeight = height;
		columns     = tileset.getWidth()/spriteWidth;
		rows        = tileset.getHeight()/spriteHeight;
	}
	public void setGrid(int columns, int rows){
		this.columns = columns; this.rows = rows;
		spriteWidth  = tileset.getWidth()/columns;
		spriteHeight = tileset.getHeight()/rows;
	}
}
