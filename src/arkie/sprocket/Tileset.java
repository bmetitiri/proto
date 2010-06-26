package arkie.sprocket;

import java.util.HashMap;
import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rect

import arkie.sprocket.Sprocket;

public class Tileset implements Sprocket {
	Bitmap tileset;
	Short[][] map;
	Short fallback;
	int columns, rows, tileWidth, tileHeight;
	public Tileset(Bitmap bitmap){
		this.tileset = bitmap;
	}
	public void draw(Canvas canvas){
		for (int x = 0; x < map.length; x++)
			for (int y = 0; y < map[0].length; y++){
				Short s = map[x][y];
				if (s == null)
					s = fallback;
				if (s != null){
					int xi = s/columns*tileWidth;
					int yi = s%columns*tileHeight;
					canvas.drawBitmap(tileset,
						new Rect(xi, yi, xi+tileWidth, yi+tileHeight),
						new Rect(x*tileWidth, y*tileHeight,
							x*tileWidth+tileWidth,
							y*tileHeight+tileHeight), null);
				}
			}
	}
	public int getHeight(){return tileHeight * map[0].length;}
	public int getWidth(){return tileWidth * map.length;}
	public void setFallback(int x, int y){setFallback((short)(x*columns+y));}
	public void setFallback(Short fallback){this.fallback = fallback;}
	// Call setTileSize OR setGrid
	public void setTileSize(int width, int height){
		tileWidth = width; tileHeight = height;
		columns     = tileset.getWidth()/tileWidth;
		rows        = tileset.getHeight()/tileHeight;
	}
	public void setGrid(int columns, int rows){
		this.columns = columns; this.rows = rows;
		tileWidth  = tileset.getWidth()/columns;
		tileHeight = tileset.getHeight()/rows;
	}
	public void setMapSize(int width, int height){
		map = new Short[width][height];
	}
	public void setMap(Short[][] map){this.map = map;}
	public boolean update(){return false;}
}
