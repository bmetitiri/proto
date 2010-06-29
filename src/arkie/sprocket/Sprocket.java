package arkie.sprocket;

import android.graphics.Canvas;
import android.view.View;
import android.view.View.OnTouchListener;

public interface Sprocket extends View.OnTouchListener{
	public void draw(Canvas canvas);
	public int getHeight();
	public int getWidth();
	public boolean update();
}
