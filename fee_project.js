document.addEventListener('DOMContentLoaded', () => {

    // Helper function to show results
    function showResult(boxId, valueId, valueStr) {
        document.getElementById(valueId).textContent = valueStr;
        document.getElementById(boxId).classList.remove('hidden');
    }

    // 1. 1RM Calculator (Epley Formula: Weight * (1 + (Reps / 30)))
    document.getElementById('onerm-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('lift-weight').value);
        const reps = parseInt(document.getElementById('lift-reps').value);

        if (reps === 1) {
            showResult('onerm-result', 'onerm-value', weight);
            return;
        }

        const onerm = Math.round(weight * (1 + (reps / 30)));
        showResult('onerm-result', 'onerm-value', onerm);

        // Populate percentages
        const pctBox = document.getElementById('onerm-percentages');
        pctBox.innerHTML = `
            <div>95%: ${Math.round(onerm * 0.95)}</div>
            <div>90%: ${Math.round(onerm * 0.90)}</div>
            <div>85%: ${Math.round(onerm * 0.85)}</div>
            <div>80%: ${Math.round(onerm * 0.80)}</div> 
        `;
    });

    // 2. FFMI Calculator = [Weight in kg * (1-(BF%/100))] / (Height in meters)^2
    document.getElementById('ffmi-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('ffmi-weight').value);
        const heightM = parseFloat(document.getElementById('ffmi-height').value) / 100;
        const bf = parseFloat(document.getElementById('ffmi-bf').value);

        const leanMass = weight * (1 - (bf / 100));
        let ffmi = leanMass / (heightM * heightM);

        // Normalized FFMI for height
        ffmi = ffmi + (6.1 * (1.8 - heightM));

        let category = 'Average';
        if (ffmi > 21 && ffmi <= 23) category = 'Advanced';
        else if (ffmi > 23 && ffmi <= 25) category = 'Elite (Natty Limit)';
        else if (ffmi > 25) category = 'Suspicious (Enhanced?)';

        document.getElementById('ffmi-category').textContent = category;
        showResult('ffmi-result', 'ffmi-value', ffmi.toFixed(1));
    });

    // 3. Macro Splitter
    document.getElementById('macro-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const cals = parseFloat(document.getElementById('macro-cals').value);
        const goal = document.getElementById('macro-goal').value;

        let p_pct = 0, c_pct = 0, f_pct = 0;

        if (goal === 'cut') { p_pct = 0.40; c_pct = 0.20; f_pct = 0.40; } // High protein/fat to preserve muscle
        else if (goal === 'maintain') { p_pct = 0.30; c_pct = 0.40; f_pct = 0.30; }
        else if (goal === 'bulk') { p_pct = 0.25; c_pct = 0.55; f_pct = 0.20; } // High carb for fuel

        const proteinGrams = Math.round((cals * p_pct) / 4);
        const carbGrams = Math.round((cals * c_pct) / 4);
        const fatGrams = Math.round((cals * f_pct) / 9);

        document.getElementById('macro-p').textContent = proteinGrams + 'g';
        document.getElementById('macro-c').textContent = carbGrams + 'g';
        document.getElementById('macro-f').textContent = fatGrams + 'g';
        document.getElementById('macro-result').classList.remove('hidden');
    });

    // 4. Wilks Calculator (Simplified Polynomials for demonstration)
    document.getElementById('wilks-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const bw = parseFloat(document.getElementById('wilks-bw').value);
        const total = parseFloat(document.getElementById('wilks-total').value);
        const gender = parseInt(document.getElementById('wilks-gender').value);

        let wilks = 0;
        // Standard Wilks coefficients
        if (gender === 1) { // Male
            const a = -216.0475144, b = 16.2606339, c = -0.002388645, d = -0.00113732, e = 7.01863E-06, f = -1.291E-08;
            const coef = 500 / (a + b * bw + c * Math.pow(bw, 2) + d * Math.pow(bw, 3) + e * Math.pow(bw, 4) + f * Math.pow(bw, 5));
            wilks = total * coef;
        } else { // Female
            const a = 594.31747775582, b = -27.23842536447, c = 0.82112226871, d = -0.00930733913, e = 0.00004731582, f = -0.00000009054;
            const coef = 500 / (a + b * bw + c * Math.pow(bw, 2) + d * Math.pow(bw, 3) + e * Math.pow(bw, 4) + f * Math.pow(bw, 5));
            wilks = total * coef;
        }

        showResult('wilks-result', 'wilks-value', Math.round(wilks));
    });

    // 5. TDEE / Bulk Estimator
    document.getElementById('tdee-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('tdee-weight').value);
        const actMultiplier = parseFloat(document.getElementById('tdee-activity').value);

        /* simplified rule of thumb BMR if bodyfat is missing: weight in kg * 22 */
        let bmr = weight * 22;

        const bfInput = document.getElementById('tdee-bf').value;
        if (bfInput) {
            // Katch-McArdle if BF is known
            const leanMass = weight * (1 - (parseFloat(bfInput) / 100));
            bmr = 370 + (21.6 * leanMass);
        }

        const tdee = bmr * actMultiplier;
        const bulk = tdee + 300;

        document.getElementById('tdee-maint').textContent = Math.round(tdee);
        document.getElementById('tdee-bulk').textContent = Math.round(bulk);
        document.getElementById('tdee-result').classList.remove('hidden');
    });

    // 6. US Navy Body Fat
    document.getElementById('navy-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const gender = parseInt(document.getElementById('navy-gender').value);
        const height = parseFloat(document.getElementById('navy-height').value);
        const neck = parseFloat(document.getElementById('navy-neck').value);
        const waist = parseFloat(document.getElementById('navy-waist').value);

        let bf = 0;
        if (gender === 1) { // Male
            bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else {
            // Assuming simplified female missing hips input for demonstration, using modified formula
            bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + waist - neck) + 0.22100 * Math.log10(height)) - 450;
        }

        showResult('navy-result', 'navy-value', bf.toFixed(1) + '%');
    });

    // 7. Find Your Exercise — Embedded Exercise Database (no external API required)
    const EXERCISE_DB = {
        '11': [ // Chest
            {
                name: 'Barbell Bench Press',
                desc: 'Lie flat on a bench, grip the bar just outside shoulder width, lower it to your mid-chest under control, then press explosively back to lockout. The king of chest mass builders.',
                primary: 'Pectoralis Major',
                secondary: 'Anterior Deltoid, Triceps'
            },
            {
                name: 'Incline Dumbbell Press',
                desc: 'Set bench to 30–45°. Press dumbbells from chest level to full extension. The incline angle shifts emphasis to the upper pec and clavicular head for a full, thick chest.',
                primary: 'Upper Pectoralis Major',
                secondary: 'Anterior Deltoid, Triceps'
            },
            {
                name: 'Cable Chest Fly',
                desc: 'Set pulleys at shoulder height. With a slight bend in the elbows, bring handles together in a wide arc in front of your chest. Constant tension through the full range — superior for hypertrophy.',
                primary: 'Pectoralis Major',
                secondary: 'Anterior Deltoid'
            },
            {
                name: 'Weighted Dips (Chest)',
                desc: 'Lean forward 30° throughout the movement to target the lower chest. Descend until shoulders are below elbows, then drive upward. Add a dip belt for progressive overload.',
                primary: 'Lower Pectoralis Major',
                secondary: 'Triceps, Anterior Deltoid'
            },
            {
                name: 'Dumbbell Pullover',
                desc: 'Lie perpendicular across a bench, hold one dumbbell overhead with both hands, lower it behind your head until you feel a deep chest and lat stretch, then pull back over. Hits both chest and serratus.',
                primary: 'Pectoralis Major',
                secondary: 'Latissimus Dorsi, Serratus Anterior'
            }
        ],
        '12': [ // Back
            {
                name: 'Barbell Deadlift',
                desc: 'Hinge at the hips, grip the bar at shoulder width, brace your core hard, and drive through the floor to lockout. The single most effective total posterior chain mass builder in existence.',
                primary: 'Erector Spinae, Trapezius',
                secondary: 'Glutes, Hamstrings, Rhomboids'
            },
            {
                name: 'Weighted Pull-Up',
                desc: 'Hang from a bar with a pronated grip slightly wider than shoulder width. Drive elbows down and back to pull your chest to the bar. Add weight via a belt once bodyweight becomes easy.',
                primary: 'Latissimus Dorsi',
                secondary: 'Biceps, Rear Deltoid, Rhomboids'
            },
            {
                name: 'Barbell Bent-Over Row',
                desc: 'Hinge to roughly 45°, retract the scapulae, and row the bar to your lower sternum. Use a controlled negative. Builds immense mid-back thickness and upper back density.',
                primary: 'Rhomboids, Middle Trapezius',
                secondary: 'Biceps, Rear Deltoid, Erector Spinae'
            },
            {
                name: 'Seated Cable Row (Close Grip)',
                desc: 'Sit upright, pull the V-bar to your lower abdomen, squeeze the scapulae hard at peak contraction, then slowly return to full arm extension. Focus on the mind-muscle connection.',
                primary: 'Latissimus Dorsi, Rhomboids',
                secondary: 'Biceps, Posterior Deltoid'
            },
            {
                name: 'Single-Arm Dumbbell Row',
                desc: 'Brace on a bench, row the dumbbell from a dead hang to your hip with a neutral grip. Go heavy — this is a mass builder, not an isolation move. Allow the shoulder blade to fully retract.',
                primary: 'Latissimus Dorsi',
                secondary: 'Biceps, Teres Major, Rear Deltoid'
            }
        ],
        '9': [ // Legs
            {
                name: 'Barbell Back Squat',
                desc: 'Bar on upper traps, feet shoulder-width. Break at the hips and knees simultaneously, descend to at least parallel, then drive the floor away. The foundational lower body mass builder.',
                primary: 'Quadriceps, Glutes',
                secondary: 'Hamstrings, Erector Spinae, Adductors'
            },
            {
                name: 'Romanian Deadlift',
                desc: 'Hold bar at hip level, push hips back while maintaining a neutral spine and slight knee bend. Lower until you feel a strong hamstring stretch, then drive hips forward to stand.',
                primary: 'Hamstrings, Glutes',
                secondary: 'Erector Spinae, Adductors'
            },
            {
                name: 'Leg Press',
                desc: 'Place feet high and wide on the platform for maximal glute and hamstring activation. Lower the sled until knees hit 90°, then press to near-lockout. Do NOT bounce at the bottom.',
                primary: 'Quadriceps, Glutes',
                secondary: 'Hamstrings, Adductors'
            },
            {
                name: 'Walking Lunges',
                desc: 'Step forward into a long stride, drop the rear knee toward the floor, then drive the lead heel to propel yourself into the next rep. Outstanding for unilateral strength and glute activation.',
                primary: 'Quadriceps, Glutes',
                secondary: 'Hamstrings, Calves, Core'
            },
            {
                name: 'Seated Calf Raise',
                desc: 'Sit with knees bent at 90°, pads on your lower thighs. Drive up onto the balls of your feet as high as possible, hold the peak contraction 1 second, and slowly lower for a full stretch. Isolates the soleus.',
                primary: 'Soleus',
                secondary: 'Gastrocnemius'
            }
        ],
        '8': [ // Arms
            {
                name: 'Barbell Curl',
                desc: 'Stand with a straight bar at hip level, elbows pinned to your sides. Curl to full contraction without swinging. The most effective movement for overall bicep mass and peak.',
                primary: 'Biceps Brachii',
                secondary: 'Brachialis, Brachioradialis'
            },
            {
                name: 'Close-Grip Bench Press',
                desc: 'Grip the bar at shoulder width on a flat bench. Lower to your lower chest and press to lockout, keeping elbows tucked at roughly 45°. The premier compound tricep mass builder.',
                primary: 'Triceps Brachii',
                secondary: 'Anterior Deltoid, Pectoralis Major'
            },
            {
                name: 'Incline Dumbbell Curl',
                desc: 'Lie back on a 60° incline, let arms hang fully. Curl both dumbbells with a supinated grip, achieving a peak squeeze. The incline creates a long-head stretch most movements miss.',
                primary: 'Biceps Brachii (Long Head)',
                secondary: 'Brachialis'
            },
            {
                name: 'Skull Crusher',
                desc: 'Lie on a flat bench, hold an EZ-bar over your forehead with arms vertical. Keeping elbows stationary, lower the bar toward your forehead, then extend back to lockout. Maximum long-head tricep stretch.',
                primary: 'Triceps Brachii (Long Head)',
                secondary: 'Anconeus'
            },
            {
                name: 'Hammer Curl',
                desc: 'Stand with dumbbells held in a neutral (hammer) grip. Curl both simultaneously without twisting your wrist. Hammers are the #1 movement for brachialis and brachioradialis thickness — the muscle that pushes the bicep up.',
                primary: 'Brachialis, Brachioradialis',
                secondary: 'Biceps Brachii'
            }
        ],
        '13': [ // Shoulders
            {
                name: 'Seated Barbell Overhead Press',
                desc: 'Press a barbell from front-rack position overhead to full lockout. Brace your core hard, do not hyperextend the lower back. The foundational shoulder mass and strength builder.',
                primary: 'Anterior & Lateral Deltoid',
                secondary: 'Triceps, Upper Trapezius, Serratus Anterior'
            },
            {
                name: 'Dumbbell Lateral Raise',
                desc: 'With a slight forward lean and bend in the elbows, raise dumbbells laterally to shoulder height, leading with your pinkies. Pause briefly at the top. This is the key to wide, capped shoulders.',
                primary: 'Lateral Deltoid',
                secondary: 'Supraspinatus, Upper Trapezius'
            },
            {
                name: 'Face Pull',
                desc: 'Set a cable pulley high, use a rope attachment. Pull toward your face, flaring your elbows out and up, finishing in an "external rotation" position. Critical for rear delt health and shoulder longevity.',
                primary: 'Rear Deltoid, External Rotators',
                secondary: 'Middle Trapezius, Rhomboids'
            },
            {
                name: 'Arnold Press',
                desc: 'Start with dumbbells at chin level, palms facing you. As you press overhead, rotate your palms forward. This full rotation recruits all three delt heads across the range of motion.',
                primary: 'Anterior, Lateral & Rear Deltoid',
                secondary: 'Triceps, Upper Trapezius'
            },
            {
                name: 'Upright Row',
                desc: 'Hold a barbell or cable at hip level with a narrow grip. Pull straight up, flaring elbows above the bar to shoulder height. Keep the bar close to your body. Builds the lateral delts and upper traps together.',
                primary: 'Lateral Deltoid, Upper Trapezius',
                secondary: 'Anterior Deltoid, Biceps'
            }
        ],
        '10': [ // Core / Abs
            {
                name: 'Weighted Cable Crunch',
                desc: 'Kneel at a high pulley with a rope attachment. Flex the spine downward, bringing your elbows toward your knees. Keep the hips stationary — all movement comes from the abs, not the hip flexors. Go heavy for mass.',
                primary: 'Rectus Abdominis',
                secondary: 'Obliques'
            },
            {
                name: 'Hanging Leg Raise',
                desc: 'Hang from a pull-up bar. Keeping legs straight, raise them to parallel or above using your core, not momentum. Avoid swinging. The premier movement for lower ab development.',
                primary: 'Rectus Abdominis (Lower)',
                secondary: 'Hip Flexors, Obliques'
            },
            {
                name: 'Ab Wheel Rollout',
                desc: 'Kneel on the floor, roll the wheel forward until your body is nearly parallel to the ground, then pull back using your abs. One of the most demanding core exercises — builds thickness and functional strength simultaneously.',
                primary: 'Rectus Abdominis',
                secondary: 'Serratus Anterior, Obliques, Latissimus Dorsi'
            },
            {
                name: 'Plank (Weighted)',
                desc: 'Hold a push-up position with arms extended or on elbows. Have a training partner place a plate on your upper back for resistance. Brace your entire core — glutes, abs, everything. Builds real core stability and strength.',
                primary: 'Transverse Abdominis, Rectus Abdominis',
                secondary: 'Obliques, Glutes, Erector Spinae'
            },
            {
                name: 'Russian Twist',
                desc: 'Sit with knees bent, lean back to 45°, and rotate a weight plate or medicine ball side to side, tapping the floor each rep. For maximum benefit, keep your feet off the floor throughout.',
                primary: 'Obliques',
                secondary: 'Rectus Abdominis, Hip Flexors'
            }
        ]
    };

    document.getElementById('api-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryId = document.getElementById('api-muscle').value;
        const resultBox = document.getElementById('api-result');
        const listContainer = document.getElementById('exercise-list');
        const submitBtn = e.target.querySelector('.submit-btn');

        submitBtn.textContent = 'Loading...';
        resultBox.classList.remove('hidden');
        listContainer.innerHTML = '';

        const exercises = EXERCISE_DB[categoryId] || [];

        // Small timeout for perceived "loading" feel
        setTimeout(() => {
            if (exercises.length === 0) {
                listContainer.innerHTML = '<p style="color: #ff3366;">No exercises found for this category.</p>';
            } else {
                exercises.forEach((ex, i) => {
                    const exerciseDiv = document.createElement('div');
                    exerciseDiv.style.cssText = 'margin-bottom:20px; padding-bottom:15px; border-bottom:1px dashed #333;';

                    const title = document.createElement('h5');
                    title.textContent = ex.name;
                    title.style.cssText = "font-size:1.4rem; color:#fff; font-family:'Teko',sans-serif; letter-spacing:1px; margin-bottom:6px;";

                    const desc = document.createElement('p');
                    desc.textContent = ex.desc;
                    desc.style.cssText = "font-size:0.95rem; color:#ccc; line-height:1.6; font-family:'Inter',sans-serif; text-transform:none;";

                    const muscleTag = document.createElement('p');
                    muscleTag.style.cssText = "font-size:0.8rem; color:var(--accent-red); font-family:'Inter',sans-serif; margin-top:6px; text-transform:none;";
                    muscleTag.textContent = `Primary: ${ex.primary}` + (ex.secondary ? `  |  Secondary: ${ex.secondary}` : '');

                    exerciseDiv.appendChild(title);
                    exerciseDiv.appendChild(desc);
                    exerciseDiv.appendChild(muscleTag);
                    listContainer.appendChild(exerciseDiv);
                });
            }
            submitBtn.textContent = 'Fetch Exercises';
        }, 400);
    });



    // 8. Interactive Rest Timer
    let timerInterval;
    const timerText = document.getElementById('timer-text');
    const stopBtn = document.getElementById('stop-timer-btn');

    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            clearInterval(timerInterval);
            let secondsLeft = parseInt(e.target.dataset.time);

            // Format quickly
            const updateDisplay = () => {
                const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
                const s = (secondsLeft % 60).toString().padStart(2, '0');
                timerText.textContent = `${m}:${s}`;
                if (secondsLeft <= 0) {
                    clearInterval(timerInterval);
                    timerText.style.color = 'var(--accent-red)';
                    setTimeout(() => timerText.style.color = 'var(--text-main)', 2000);
                }
            };

            timerText.style.color = 'var(--accent-yellow)';
            updateDisplay();

            timerInterval = setInterval(() => {
                secondsLeft--;
                updateDisplay();
            }, 1000);
        });
    });

    stopBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerText.textContent = '00:00';
        timerText.style.color = 'var(--text-main)';
    });

    // 9. Workout To-Do List
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (!taskText) return;

        const li = document.createElement('li');
        li.className = 'todo-item';

        const span = document.createElement('span');
        span.textContent = taskText;
        span.style.fontFamily = "'Inter', sans-serif";
        span.style.fontSize = "1.1rem";
        span.style.cursor = "pointer";
        span.title = "Click to mark completed";

        span.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&#10005;'; // X mark
        delBtn.className = 'todo-delete';
        delBtn.addEventListener('click', () => li.remove());

        li.appendChild(span);
        li.appendChild(delBtn);
        todoList.appendChild(li);

        todoInput.value = '';
    });



    // Interactive Mouse Parallax for Background Image
    const globalBg = document.getElementById('global-bg');
    if (globalBg) {
        document.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to center of screen
            const x = (window.innerWidth / 2 - e.pageX) / 20;
            const y = (window.innerHeight / 2 - e.pageY) / 20;
            globalBg.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Auth Modal Logic
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const switchAuth = document.getElementById('switch-auth');
    const switchText = document.getElementById('switch-text');
    const modalTitle = document.getElementById('modal-title');
    const authForm = document.getElementById('auth-form');
    const authSubmitBtn = authForm?.querySelector('.submit-btn');
    let isLogin = true;

    authBtn?.addEventListener('click', () => {
        authModal.classList.remove('hidden');
    });

    closeModal?.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });

    // Close on click outside
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
        }
    });

    switchAuth?.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        if (isLogin) {
            modalTitle.textContent = 'ACCESS ARSENAL';
            authSubmitBtn.textContent = 'SIGN IN';
            switchText.textContent = 'New recruit? ';
            switchAuth.textContent = 'Create Account';
        } else {
            modalTitle.textContent = 'JOIN THE SHIELD';
            authSubmitBtn.textContent = 'CREATE ACCOUNT';
            switchText.textContent = 'Already forged? ';
            switchAuth.textContent = 'Sign In';
        }
    });

    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Mock authentication
        const email = document.getElementById('auth-email').value;
        alert(`${isLogin ? 'Signed in' : 'Account created'} successfully!`);
        authModal.classList.add('hidden');
        authBtn.textContent = 'PROFILE';
        authBtn.style.backgroundColor = 'var(--accent-yellow)';
        authBtn.style.color = '#000';
    });

    document.querySelector('.google-btn')?.addEventListener('click', () => {
        alert("Google Sign-In Mock: Authenticated successfully!");
        authModal.classList.add('hidden');
        authBtn.textContent = 'PROFILE';
        authBtn.style.backgroundColor = 'var(--accent-yellow)';
        authBtn.style.color = '#000';
    });

    // -----------------------------------------------------
    //  Interactive "Living" Background (Embers Particle System)
    // -----------------------------------------------------
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray = [];
        const numberOfParticles = 80; // High particle density for cool effect

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Sizes range from small dust to glowing embers
                this.size = Math.random() * 2.5 + 0.5;
                // Move mostly slowly upwards and drift sideways
                this.speedX = Math.random() * 0.8 - 0.4;
                this.speedY = Math.random() * -1.5 - 0.5;
                this.opacity = Math.random() * 0.6 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Reset position if it floats off string
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x > canvas.width || this.x < 0) {
                    this.speedX = -this.speedX; // Bounce horizontally very lightly
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

                // Aggressive Iron forge embers
                ctx.fillStyle = `rgba(255, 51, 102, ${this.opacity})`; // Blood Red 
                ctx.fill();
            }
        }

        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
});