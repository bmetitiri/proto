package arkie.sprocket;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Rect;
import java.util.HashMap;

public class Tileset implements Sprocket {
	Bitmap tileset; Controller main;
	Short[][] map; Short fallback;
	float x, y; int columns, rows, tileWidth, tileHeight;
	public Tileset(Controller main, Bitmap bitmap){
		this.main = main;
		this.tileset = bitmap;
	}
	public void draw(Canvas canvas){
		Rect camera = main.getCamera();
		for (int x = 0; x < map.length; x++)
			for (int y = 0; y < map[0].length; y++){
				int viewX = x*tileWidth - camera.left;
				int viewY = y*tileHeight - camera.top;
				if (viewX+tileWidth > camera.left &&
						viewX < camera.right &&
						viewY+tileHeight > camera.top &&
						viewY < camera.bottom){
					Short s = map[x][y];
					if (s == null) s = fallback;
					if (s != null){
						int xi = s/columns*tileWidth;
						int yi = s%columns*tileHeight;
						canvas.drawBitmap(tileset,
							new Rect(xi, yi, xi+tileWidth, yi+tileHeight),
							new Rect(viewX, viewY, viewX+tileWidth,
								viewY+tileHeight), null);
					}
				}
			}
	}
	public int getHeight(){return tileHeight * map[0].length;}
	public int getWidth(){return tileWidth * map.length;}
	public void setFallback(int x, int y){setFallback((short)(x*columns+y));}
	public void setFallback(Short fallback){this.fallback = fallback;}
	public void setTileSize(int width, int height){
		tileWidth = width; tileHeight = height;
		columns     = tileset.getWidth()/tileWidth;
		rows        = tileset.getHeight()/tileHeight;
	}
	public void setMapSize(int width, int height){
		map = new Short[width][height];
	}
	public void setMap(Short[][] map){this.map = map;}
	public boolean update(){return false;}
}
