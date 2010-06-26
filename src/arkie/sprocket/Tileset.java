package arkie.sprocket;

import java.util.HashMap;
import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect

import arkie.sprocket.Sprocket;

public class Tileset implements Sprocket {
	Bitmap tileset;
	Short[][] map;
	Short fallback;
	int columns, rows, spriteWidth, spriteHeight;
	public Tileset(Context context, int tileset){
		this.tileset = BitmapFactory.decodeResource(
				context.getResources(), tileset);
		setGrid(30, 16); // TODO: This is the default for RPGMaker ...
		map = new Short[10][10]; // TODO: Default map size, move along
	}
	public void draw(Canvas canvas){
		for (int x = 0; x < map.length; x++)
			for (int y = 0; y < map[0].length; y++){
				Short s = map[x][y];
				if (s == null)
					s = fallback;
				if (s != null){
					int xi = s/columns*spriteWidth;
					int yi = s%columns*spriteHeight;
					canvas.drawBitmap(tileset,
						new Rect(xi, yi, xi+spriteWidth, yi+spriteHeight),
						new Rect(x*spriteWidth, y*spriteHeight,
							x*spriteWidth+spriteWidth,
							y*spriteHeight+spriteHeight), null);
				}
			}
	}
	public int getHeight(){return spriteHeight * map[0].length;}
	public int getWidth(){return spriteWidth * map.length;}
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
