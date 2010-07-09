package arkie.sprocket;

import android.graphics.Bitmap;
import android.graphics.Point;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;

public class Player extends Charset {
	Point destination = new Point();
	int speed = 5;
	public Player(Controller main, Bitmap bitmap){
		super(main, bitmap);
		main.addListener(MotionEvent.ACTION_UP, this);
	}
	public void setDestination(int x, int y){
		Rect camera = main.getCamera();
		destination.x = camera.left+x-width/2;
		destination.y = camera.top+y-height/2;
	}
	public boolean onTouch(View view, MotionEvent event){
		setDestination((int)event.getX(), (int)event.getY());
		return true;
	}
	@Override public boolean update(){
		animate = true;
		if (x > destination.x + speed){
			direction = Direction.LEFT;
			x -= speed;
		} else if (x < destination.x - speed){
			direction = Direction.RIGHT;
		   	x += speed;
		} else if (y > destination.y + speed){
			direction = Direction.UP;
			y -= speed;
		} else if (y < destination.y - speed){
			direction = Direction.DOWN;
			y += speed;
		} else animate = false;
		super.update();
		return true;
	}
}
