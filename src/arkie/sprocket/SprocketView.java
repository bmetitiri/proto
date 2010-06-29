package arkie.sprocket;

import android.content.Context;
import android.graphics.Canvas;
import android.view.MotionEvent;
import android.view.View;
import java.util.ArrayList;
import java.util.Collection;

public class SprocketView extends View {
	Collection<Sprocket> sprockets;
	Controller main;
	public SprocketView (Controller main, Collection sprockets){
		super(main.getContext());
		this.main = main;
		this.sprockets = sprockets;
	}
	public void addSprocket(Sprocket sprocket){sprockets.add(sprocket);}
	@Override protected void onDraw(Canvas canvas) {
		for (Sprocket sprocket: sprockets)
			sprocket.draw(canvas);
	}
	@Override public boolean onTouchEvent(MotionEvent event) {
		return main.onTouch(this, event);
	}
}
