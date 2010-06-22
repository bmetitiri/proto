package arkie.sprockets;

import android.content.Context;
import android.graphics.*; //Bitmap, BitmapFactory, Canvas, Rectangle

public class Sprite {
	Bitmap bitmap;
	int height, width, type = 0;
	public Sprite(){}
	public Sprite(Context context, int bitmap){
		this.setBitmap(context, bitmap);
	}
	public Sprite(Bitmap bitmap){this.setBitmap(bitmap);}
	public void draw(Canvas canvas, float x, float y){
		canvas.drawBitmap(this.bitmap, x, y, null);
	}
	public void setBitmap(Context context, int bitmap){
		setBitmap(BitmapFactory.decodeResource(context.getResources(), bitmap));
	}
	public void setBitmap(Bitmap bitmap){
		this.bitmap = bitmap;
		this.height = bitmap.getHeight();
		this.width = bitmap.getWidth();
	}
	public int getHeight(){return this.height;}
	public int getWidth(){return this.width;}
	public int getType(){return this.type;}
	public void setType(int type){this.type = type;}
}
