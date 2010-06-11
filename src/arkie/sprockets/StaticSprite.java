package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Recta

import arkie.sprockets.Sprite;

public class StaticSprite implements Sprite {
	Bitmap bitmap;
	int height, width;
	public StaticSprite(Bitmap bitmap){
		this.setBitmap(bitmap);
	}
	public StaticSprite(Context context, int bitmap){
		this(BitmapFactory.decodeResource(context.getResources(), bitmap));
	}
	public void draw(Canvas canvas, Rect rect){
		canvas.drawBitmap(this.bitmap, null, rect, null);
	}
	public void setBitmap(Bitmap bitmap){
		this.bitmap = bitmap;
		this.height = bitmap.getHeight();
		this.width = bitmap.getWidth();
	}
	public int getHeight(){return this.height;}
	public int getWidth(){return this.width;}
}

