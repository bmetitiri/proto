package arkie.sprocket;

import java.util.*; //Collection, ArrayList
import android.content.Context;
import android.graphics.Canvas;
import android.view.View;

import arkie.sprocket.Sprocket;

public class SprocketView extends View {
	Collection<Sprocket> sprockets = new ArrayList<Sprocket>();
	public SprocketView (Context context){super(context);}
	public void addSprocket(Sprocket sprocket){sprockets.add(sprocket);}
	@Override protected void onDraw(Canvas canvas) {
		for (Sprocket sprocket: sprockets)
			sprocket.draw(canvas);
	}
}
